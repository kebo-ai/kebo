import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { eq } from "drizzle-orm"
import { accountTypes, dynamicBanners, icons } from "@/db/schema"
import { optionalAuthMiddleware } from "@/middleware"
import type { AppEnv } from "@/types/env"

const BannerQuerySchema = z.object({
  language: z.string().default("en"),
  appVersion: z.string().optional(),
})

// Routes
const iconsRoute = createRoute({
  method: "get",
  path: "/icons",
  tags: ["Reference"],
  summary: "List all icons",
  responses: { 200: { description: "List of icons" } },
})

const accountTypesRoute = createRoute({
  method: "get",
  path: "/account-types",
  tags: ["Reference"],
  summary: "List account types",
  responses: { 200: { description: "List of account types" } },
})

const bannersRoute = createRoute({
  method: "get",
  path: "/banners",
  tags: ["Reference"],
  summary: "Get dynamic banners",
  request: { query: BannerQuerySchema },
  responses: { 200: { description: "Dynamic banners" } },
})

const base = new OpenAPIHono<AppEnv>()
base.use("/*", optionalAuthMiddleware)

const app = base
  .openapi(iconsRoute, async (c) => {
    const db = c.get("db")
    const result = await db
      .select()
      .from(icons)
      .where(eq(icons.is_deleted, false))
    return c.json({ data: result }, 200)
  })
  .openapi(accountTypesRoute, async (c) => {
    const db = c.get("db")
    const result = await db
      .select()
      .from(accountTypes)
      .where(eq(accountTypes.is_deleted, false))
    return c.json({ data: result }, 200)
  })
  .openapi(bannersRoute, async (c) => {
    const db = c.get("db")
    const result = await db
      .select()
      .from(dynamicBanners)
      .where(eq(dynamicBanners.visible, true))
    return c.json({ data: result }, 200)
  })

export default app
