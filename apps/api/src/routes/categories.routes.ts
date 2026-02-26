import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, eq } from "drizzle-orm"
import { categories } from "@/db/schema"
import { authMiddleware } from "@/middleware"
import type { AppEnv } from "@/types/env"

const CategoryParamsSchema = z.object({
  id: z.string().uuid(),
})

const CategoryQuerySchema = z.object({
  type: z
    .enum(["Income", "Expense", "Transfer", "Investment", "Other"])
    .optional(),
})

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["Income", "Expense", "Transfer", "Investment", "Other"]),
  icon_url: z.string().optional(),
  icon_emoji: z.string().optional(),
  color_id: z.number().optional(),
})

// Routes
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Categories"],
  summary: "List categories",
  security: [{ Bearer: [] }],
  request: { query: CategoryQuerySchema },
  responses: { 200: { description: "List of categories" } },
})

const createCategoryRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Categories"],
  summary: "Create a category",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateCategorySchema } } },
  },
  responses: { 201: { description: "Category created" } },
})

const updateCategoryRoute = createRoute({
  method: "put",
  path: "/:id",
  tags: ["Categories"],
  summary: "Update a category",
  security: [{ Bearer: [] }],
  request: {
    params: CategoryParamsSchema,
    body: {
      content: {
        "application/json": { schema: CreateCategorySchema.partial() },
      },
    },
  },
  responses: { 200: { description: "Category updated" } },
})

const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Categories"],
  summary: "Delete a category (soft delete)",
  security: [{ Bearer: [] }],
  request: { params: CategoryParamsSchema },
  responses: { 200: { description: "Category deleted" } },
})

const base = new OpenAPIHono<AppEnv>()
base.use("/*", authMiddleware)

const app = base
  .openapi(listRoute, async (c) => {
    const userId = c.get("userId")
    const { type } = c.req.valid("query")
    const db = c.get("db")

    const conditions = [
      eq(categories.user_id, userId),
      eq(categories.is_deleted, false),
    ]
    if (type) {
      conditions.push(eq(categories.type, type))
    }

    const result = await db
      .select()
      .from(categories)
      .where(and(...conditions))

    return c.json({ data: result }, 200)
  })
  .openapi(createCategoryRoute, async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")
    const db = c.get("db")

    const [category] = await db
      .insert(categories)
      .values({ ...body, user_id: userId })
      .returning()

    return c.json(category, 201)
  })
  .openapi(updateCategoryRoute, async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const body = c.req.valid("json")
    const db = c.get("db")

    const [category] = await db
      .update(categories)
      .set({ ...body, updated_at: new Date() })
      .where(and(eq(categories.id, id), eq(categories.user_id, userId)))
      .returning()

    if (!category) {
      return c.json({ error: "Category not found" }, 404)
    }
    return c.json(category, 200)
  })
  .openapi(deleteCategoryRoute, async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const db = c.get("db")

    const [category] = await db
      .update(categories)
      .set({ is_deleted: true, deleted_at: new Date(), updated_at: new Date() })
      .where(and(eq(categories.id, id), eq(categories.user_id, userId)))
      .returning()

    if (!category) {
      return c.json({ error: "Category not found" }, 404)
    }
    return c.json({ success: true }, 200)
  })

export default app
