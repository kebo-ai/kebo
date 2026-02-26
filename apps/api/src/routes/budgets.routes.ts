import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { upsertBudgetSchema } from "@/db/schema"
import { authMiddleware } from "@/middleware"
import { BudgetService } from "@/services"
import type { AppEnv } from "@/types/env"

const BudgetParamsSchema = z.object({
  id: z.string().uuid(),
})

const BudgetCategoryParamsSchema = z.object({
  budgetId: z.string().uuid(),
  categoryId: z.string().uuid(),
})

// Routes
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Budgets"],
  summary: "List all budgets",
  security: [{ Bearer: [] }],
  responses: { 200: { description: "List of budgets" } },
})

const getRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Budgets"],
  summary: "Get budget by ID with details",
  security: [{ Bearer: [] }],
  request: { params: BudgetParamsSchema },
  responses: {
    200: { description: "Budget details with lines" },
    404: { description: "Budget not found" },
  },
})

const upsertRoute = createRoute({
  method: "put",
  path: "/",
  tags: ["Budgets"],
  summary: "Create or update a budget",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: upsertBudgetSchema } } },
  },
  responses: { 200: { description: "Budget upserted" } },
})

const deleteRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Budgets"],
  summary: "Delete a budget",
  security: [{ Bearer: [] }],
  request: { params: BudgetParamsSchema },
  responses: {
    200: { description: "Budget deleted" },
    404: { description: "Budget not found" },
  },
})

const categoryDetailsRoute = createRoute({
  method: "get",
  path: "/:budgetId/categories/:categoryId",
  tags: ["Budgets"],
  summary: "Get budget category with transactions",
  security: [{ Bearer: [] }],
  request: { params: BudgetCategoryParamsSchema },
  responses: { 200: { description: "Category details with transactions" } },
})

const base = new OpenAPIHono<AppEnv>()
base.use("/*", authMiddleware)

const app = base
  .openapi(listRoute, async (c) => {
    const userId = c.get("userId")
    const budgets = await BudgetService.list(c.get("db"), userId)
    return c.json({ data: budgets }, 200)
  })
  .openapi(getRoute, async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const budget = await BudgetService.getById(c.get("db"), userId, id)
    if (!budget) {
      return c.json({ error: "Budget not found" }, 404)
    }
    return c.json(budget, 200)
  })
  .openapi(upsertRoute, async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")
    const budget = await BudgetService.upsert(c.get("db"), userId, body)
    return c.json(budget, 200)
  })
  .openapi(deleteRoute, async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    try {
      await BudgetService.delete(c.get("db"), userId, id)
      return c.json({ success: true }, 200)
    } catch {
      return c.json({ error: "Budget not found" }, 404)
    }
  })
  .openapi(categoryDetailsRoute, async (c) => {
    const userId = c.get("userId")
    const { budgetId, categoryId } = c.req.valid("param")
    try {
      const details = await BudgetService.getCategoryDetails(
        c.get("db"),
        userId,
        budgetId,
        categoryId,
      )
      return c.json(details, 200)
    } catch (error) {
      return c.json({ error: (error as Error).message }, 404)
    }
  })

export default app
