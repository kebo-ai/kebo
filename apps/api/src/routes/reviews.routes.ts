import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { authMiddleware } from "@/middleware"
import { ReviewService } from "@/services"
import type { AppEnv } from "@/types/env"

const RecordActionSchema = z.object({
  action: z.enum(["rated", "dismissed", "later"]),
  rating: z.number().int().min(1).max(5).optional(),
})

// Routes
const eligibilityRoute = createRoute({
  method: "get",
  path: "/eligibility",
  tags: ["Reviews"],
  summary: "Check rating modal eligibility",
  security: [{ Bearer: [] }],
  responses: { 200: { description: "Eligibility status" } },
})

const recordActionRoute = createRoute({
  method: "post",
  path: "/action",
  tags: ["Reviews"],
  summary: "Record rating modal action",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: RecordActionSchema } } },
  },
  responses: { 200: { description: "Action recorded" } },
})

const base = new OpenAPIHono<AppEnv>()
base.use("/*", authMiddleware)

const app = base
  .openapi(eligibilityRoute, async (c) => {
    const userId = c.get("userId")
    const result = await ReviewService.checkEligibility(c.get("db"), userId)
    return c.json(result, 200)
  })
  .openapi(recordActionRoute, async (c) => {
    const userId = c.get("userId")
    const { action, rating } = c.req.valid("json")
    const interaction = await ReviewService.recordInteraction(
      c.get("db"),
      userId,
      action,
      rating,
    )
    return c.json(interaction, 200)
  })

export default app
