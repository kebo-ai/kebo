import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { EmbeddingService } from "@/services/embedding.service"
import { adminRateLimitMiddleware, adminBodyLimit } from "@/middleware"
import type { AppEnv } from "@/types/env"

/**
 * Timing-safe comparison to prevent timing attacks on admin key.
 * Pads shorter string to match length so XOR loop always runs
 * the same number of iterations regardless of input.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)

  const maxLen = Math.max(bufA.length, bufB.length)
  let result = bufA.length ^ bufB.length // non-zero if lengths differ

  for (let i = 0; i < maxLen; i++) {
    result |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0)
  }

  return result === 0
}

const base = new OpenAPIHono<AppEnv>()

// Rate limit admin endpoints (5 req/min per IP)
base.use("/*", adminRateLimitMiddleware)

// Larger body limit for document ingestion (5MB)
base.use("/*", adminBodyLimit)

// Admin key middleware (timing-safe comparison)
base.use("/*", async (c, next) => {
  const apiKey = c.req.header("X-Admin-Key")
  if (!apiKey || !timingSafeEqual(apiKey, c.env.ADMIN_API_KEY)) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  await next()
})

const ingestDocumentRoute = createRoute({
  method: "post",
  path: "/ingest",
  tags: ["Admin"],
  summary: "Ingest a text document into the knowledge base",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            content: z.string().min(1),
            source: z.string().min(1),
            page: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "Document ingested" },
    401: { description: "Unauthorized" },
    500: { description: "Ingestion error" },
  },
})

const listSourcesRoute = createRoute({
  method: "get",
  path: "/sources",
  tags: ["Admin"],
  summary: "List all document sources in knowledge base",
  responses: {
    200: { description: "List of sources" },
    401: { description: "Unauthorized" },
  },
})

const deleteSourceRoute = createRoute({
  method: "delete",
  path: "/sources/{source}",
  tags: ["Admin"],
  summary: "Delete all chunks for a source",
  request: {
    params: z.object({ source: z.string() }),
  },
  responses: {
    200: { description: "Source deleted" },
    401: { description: "Unauthorized" },
  },
})

const app = base
  .openapi(ingestDocumentRoute, async (c) => {
    const body = c.req.valid("json")
    const db = c.get("db")

    try {
      const count = await EmbeddingService.ingestDocument(
        db,
        c.env.AI_GATEWAY_API_KEY,
        body.content,
        body.source,
        body.page,
      )

      return c.json({ success: true, chunks_created: count })
    } catch (error) {
      console.error("Ingestion error:", error)
      return c.json({ error: "Ingestion failed" }, 500)
    }
  })
  .openapi(listSourcesRoute, async (c) => {
    const db = c.get("db")
    const sources = await EmbeddingService.listSources(db)
    return c.json({ sources })
  })
  .openapi(deleteSourceRoute, async (c) => {
    const { source } = c.req.valid("param")
    const db = c.get("db")

    await EmbeddingService.deleteBySource(db, source)
    return c.json({ success: true, deleted_source: source })
  })

export default app
