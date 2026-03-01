import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { authMiddleware } from "@/middleware"
import { TransactionService } from "@/services"
import type { AppEnv } from "@/types/env"

const TransactionParamsSchema = z.object({
  id: z.string().uuid().openapi({ description: "Transaction ID" }),
})

const TransactionListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1)
    .openapi({ description: "Page number" }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
    .openapi({ description: "Items per page" }),
  transactionType: z
    .enum(["Income", "Expense", "Transfer"])
    .optional()
    .openapi({ description: "Transaction type filter" }),
  startDate: z
    .string()
    .datetime()
    .optional()
    .openapi({ description: "Start date filter (ISO 8601)" }),
  endDate: z
    .string()
    .datetime()
    .optional()
    .openapi({ description: "End date filter (ISO 8601)" }),
  accountIds: z
    .string()
    .optional()
    .openapi({ description: "Comma-separated account IDs" }),
  categoryIds: z
    .string()
    .optional()
    .openapi({ description: "Comma-separated category IDs" }),
})

const CreateTransactionSchema = z.object({
  category_id: z.string().uuid().optional(),
  account_id: z.string().uuid(),
  transaction_type: z.enum(["Income", "Expense", "Transfer"]),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: "Amount must be a positive number with up to 2 decimal places",
    }),
  currency: z.string().length(3).default("USD"),
  description: z.string().optional(),
  date: z.string().datetime(),
  is_recurring: z.boolean().optional(),
  recurrence_cadence: z
    .enum(["Never", "Daily", "Weekly", "Monthly", "Yearly"])
    .optional(),
  recurrence_end_date: z.string().datetime().optional(),
  from_account_id: z.string().uuid().optional(),
  icon_url: z.string().url().optional(),
})

const CreateTransferSchema = z.object({
  from_account_id: z.string().uuid(),
  to_account_id: z.string().uuid(),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: "Amount must be a positive number with up to 2 decimal places",
    }),
  currency: z.string().length(3).optional(),
  description: z.string().optional(),
  date: z.string().datetime(),
})

// Routes
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Transactions"],
  summary: "List transactions",
  description: "Get paginated list of user transactions with optional filters",
  security: [{ Bearer: [] }],
  request: { query: TransactionListQuerySchema },
  responses: {
    200: { description: "List of transactions" },
    401: { description: "Unauthorized" },
  },
})

const getRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Transactions"],
  summary: "Get transaction by ID",
  security: [{ Bearer: [] }],
  request: { params: TransactionParamsSchema },
  responses: {
    200: { description: "Transaction details" },
    404: { description: "Transaction not found" },
  },
})

const createTransactionRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Transactions"],
  summary: "Create a transaction",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateTransactionSchema } },
    },
  },
  responses: {
    201: { description: "Transaction created" },
    400: { description: "Validation error" },
  },
})

const updateRoute = createRoute({
  method: "put",
  path: "/:id",
  tags: ["Transactions"],
  summary: "Update a transaction",
  security: [{ Bearer: [] }],
  request: {
    params: TransactionParamsSchema,
    body: {
      content: {
        "application/json": { schema: CreateTransactionSchema.partial() },
      },
    },
  },
  responses: {
    200: { description: "Transaction updated" },
    404: { description: "Transaction not found" },
  },
})

const deleteRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Transactions"],
  summary: "Delete a transaction (soft delete)",
  security: [{ Bearer: [] }],
  request: { params: TransactionParamsSchema },
  responses: {
    200: { description: "Transaction deleted" },
    404: { description: "Transaction not found" },
  },
})

const recurringRoute = createRoute({
  method: "get",
  path: "/recurring",
  tags: ["Transactions"],
  summary: "Get recurring transactions",
  security: [{ Bearer: [] }],
  responses: {
    200: { description: "List of recurring transactions" },
  },
})

const transferRoute = createRoute({
  method: "post",
  path: "/transfer",
  tags: ["Transactions"],
  summary: "Create a transfer between accounts",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateTransferSchema } } },
  },
  responses: {
    201: { description: "Transfer created" },
    400: { description: "Validation error" },
  },
})

const balanceRoute = createRoute({
  method: "get",
  path: "/balance",
  tags: ["Transactions"],
  summary: "Get user balance",
  security: [{ Bearer: [] }],
  responses: {
    200: { description: "User balance" },
  },
})

// Apply middleware and handlers
const base = new OpenAPIHono<AppEnv>()
base.use("/*", authMiddleware)

const app = base
  .openapi(listRoute, async (c) => {
    const userId = c.get("userId")
    const query = c.req.valid("query")
    const result = await TransactionService.list(c.get("db"), userId, {
      ...query,
      accountIds: query.accountIds?.split(",").filter(Boolean),
      categoryIds: query.categoryIds?.split(",").filter(Boolean),
    })
    return c.json(result, 200)
  })
  // Register /balance and /recurring BEFORE /:id to avoid route conflicts
  .openapi(balanceRoute, async (c) => {
    const userId = c.get("userId")
    const balance = await TransactionService.getBalance(c.get("db"), userId)
    return c.json(balance, 200)
  })
  .openapi(recurringRoute, async (c) => {
    const userId = c.get("userId")
    const transactions = await TransactionService.getRecurring(
      c.get("db"),
      userId,
    )
    return c.json({ data: transactions }, 200)
  })
  .openapi(transferRoute, async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")

    if (body.from_account_id === body.to_account_id) {
      return c.json({ error: "Cannot transfer to the same account" }, 400)
    }

    try {
      const result = await TransactionService.createTransfer(
        c.get("db"),
        userId,
        {
          fromAccountId: body.from_account_id,
          toAccountId: body.to_account_id,
          amount: body.amount,
          currency: body.currency,
          description: body.description,
          date: body.date,
        },
      )
      return c.json(result, 201)
    } catch (error) {
      if (error instanceof Error && error.message.includes("do not belong")) {
        return c.json({ error: "One or both accounts not found" }, 403)
      }
      throw error
    }
  })
  .openapi(getRoute, async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const transaction = await TransactionService.getById(c.get("db"), userId, id)
    if (!transaction) {
      return c.json({ error: "Transaction not found" }, 404)
    }
    return c.json(transaction, 200)
  })
  .openapi(createTransactionRoute, async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")

    const transaction = await TransactionService.create(c.get("db"), userId, {
      ...body,
      date: new Date(body.date),
      recurrence_end_date: body.recurrence_end_date
        ? new Date(body.recurrence_end_date)
        : undefined,
    })
    return c.json(transaction, 201)
  })
  .openapi(updateRoute, async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const body = c.req.valid("json")
    const transaction = await TransactionService.update(c.get("db"), userId, id, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      recurrence_end_date: body.recurrence_end_date
        ? new Date(body.recurrence_end_date)
        : undefined,
    })
    if (!transaction) {
      return c.json({ error: "Transaction not found" }, 404)
    }
    return c.json(transaction, 200)
  })
  .openapi(deleteRoute, async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const transaction = await TransactionService.softDelete(
      c.get("db"),
      userId,
      id,
    )
    if (!transaction) {
      return c.json({ error: "Transaction not found" }, 404)
    }
    return c.json({ success: true }, 200)
  })

export default app
