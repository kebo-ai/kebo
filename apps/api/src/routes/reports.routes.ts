import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { authMiddleware } from "@/middleware"
import { ReportService } from "@/services"
import type { AppEnv } from "@/types/env"

const app = new OpenAPIHono<AppEnv>()

// Schema for expense by category (monthly report)
const ExpenseByCategoryQuerySchema = z.object({
  periodDate: z
    .string()
    .optional()
    .default(new Date().toISOString().split("T")[0])
    .openapi({ description: "Period date (YYYY-MM-DD), defaults to today" }),
})

// Schema for income/expense report with granularity
const IncomeExpenseQuerySchema = z.object({
  periodDate: z
    .string()
    .optional()
    .default(new Date().toISOString().split("T")[0])
    .openapi({ description: "Period date (YYYY-MM-DD), defaults to today" }),
  granularity: z
    .enum(["year", "month", "week"])
    .optional()
    .default("month")
    .openapi({ description: "Report granularity: year, month, or week" }),
})

// Routes
const expenseByCategoryRoute = createRoute({
  method: "get",
  path: "/expense-by-category",
  tags: ["Reports"],
  summary: "Get expense breakdown by category for a month",
  description:
    "Returns expense breakdown by category with percentages, bar colors, and period navigation",
  security: [{ Bearer: [] }],
  request: { query: ExpenseByCategoryQuerySchema },
  responses: { 200: { description: "Expense breakdown by category" } },
})

const incomeExpenseRoute = createRoute({
  method: "get",
  path: "/income-expense",
  tags: ["Reports"],
  summary: "Get comprehensive income vs expense report",
  description:
    "Returns time series data, category breakdowns, summaries, and period navigation",
  security: [{ Bearer: [] }],
  request: { query: IncomeExpenseQuerySchema },
  responses: { 200: { description: "Income vs expense report" } },
})

app.use("/*", authMiddleware)

app.openapi(expenseByCategoryRoute, async (c) => {
  const userId = c.get("userId")
  const query = c.req.valid("query")
  const report = await ReportService.getExpenseReportByCategory(
    c.get("db"),
    userId,
    {
      periodDate: query.periodDate,
    },
  )
  return c.json(report, 200)
})

app.openapi(incomeExpenseRoute, async (c) => {
  const userId = c.get("userId")
  const query = c.req.valid("query")
  const report = await ReportService.getIncomeExpenseReport(
    c.get("db"),
    userId,
    {
      periodDate: query.periodDate,
      granularity: query.granularity,
    },
  )
  return c.json(report, 200)
})

export default app
