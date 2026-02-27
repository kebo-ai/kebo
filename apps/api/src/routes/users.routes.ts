import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { authMiddleware } from "@/middleware"
import { UserService } from "@/services"
import type { AppEnv } from "@/types/env"

const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  country: z.string().max(2).optional(),
  currency: z.string().max(3).optional(),
  avatar_url: z.string().url().optional(),
})

// Routes
const getProfileRoute = createRoute({
  method: "get",
  path: "/profile",
  tags: ["Users"],
  summary: "Get user profile",
  security: [{ Bearer: [] }],
  responses: { 200: { description: "User profile" } },
})

const updateProfileRoute = createRoute({
  method: "put",
  path: "/profile",
  tags: ["Users"],
  summary: "Update user profile",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: UpdateProfileSchema } } },
  },
  responses: { 200: { description: "Profile updated" } },
})

const deleteAccountRoute = createRoute({
  method: "delete",
  path: "/",
  tags: ["Users"],
  summary: "Hard delete user account",
  description:
    "Permanently deletes all user data. This action cannot be undone.",
  security: [{ Bearer: [] }],
  responses: { 200: { description: "Account deleted" } },
})

const base = new OpenAPIHono<AppEnv>()
base.use("/*", authMiddleware)

const app = base
  .openapi(getProfileRoute, async (c) => {
    const userId = c.get("userId")
    const profile = await UserService.getProfile(c.get("db"), userId)
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404)
    }
    return c.json(profile, 200)
  })
  .openapi(updateProfileRoute, async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")
    const profile = await UserService.updateProfile(c.get("db"), userId, body)
    return c.json(profile, 200)
  })
  .openapi(deleteAccountRoute, async (c) => {
    const userId = c.get("userId")
    await UserService.hardDelete(c.get("db"), userId)
    return c.json({ success: true, message: "Account deleted" }, 200)
  })

export default app
