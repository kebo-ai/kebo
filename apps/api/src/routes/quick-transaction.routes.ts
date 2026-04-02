import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, eq } from "drizzle-orm"
import { authMiddleware } from "@/middleware"
import { TransactionService } from "@/services"
import { accounts } from "@/db/schema"
import type { AppEnv } from "@/types/env"

const QuickTransactionSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: "Amount must be a positive number with up to 2 decimal places",
    }),
  currency: z.string().length(3).default("USD"),
  merchant: z.string().min(1).max(500),
  date: z.string().datetime().optional(),
})

const quickCreateRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Transactions"],
  summary: "Quick-create a transaction from Apple Pay Shortcut",
  description:
    "Minimal endpoint for the iOS Shortcuts automation. Finds the user's default account and creates an expense.",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: { "application/json": { schema: QuickTransactionSchema } },
    },
  },
  responses: {
    201: { description: "Transaction created" },
    400: { description: "Validation error" },
    404: { description: "No account found" },
  },
})

const base = new OpenAPIHono<AppEnv>()
base.use("/*", authMiddleware)

const app = base.openapi(quickCreateRoute, async (c) => {
  const userId = c.get("userId")
  const db = c.get("db")
  const body = c.req.valid("json")

  // Find user's default account, fallback to first non-deleted account
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.user_id, userId),
        eq(accounts.is_deleted, false),
        eq(accounts.is_default, true),
      ),
    )
    .limit(1)

  const targetAccount = account
    ? account
    : (
        await db
          .select({ id: accounts.id })
          .from(accounts)
          .where(
            and(
              eq(accounts.user_id, userId),
              eq(accounts.is_deleted, false),
            ),
          )
          .limit(1)
      )[0]

  if (!targetAccount) {
    return c.json({ error: "No account found. Please create an account first." }, 404)
  }

  const transaction = await TransactionService.create(db, userId, {
    account_id: targetAccount.id,
    transaction_type: "Expense",
    amount: body.amount,
    currency: body.currency,
    description: body.merchant,
    date: body.date ? new Date(body.date) : new Date(),
    metadata: {
      source: "apple_pay_shortcut",
      merchant: body.merchant,
      pending: true,
    },
  })

  return c.json({ id: transaction.id, status: "ok" }, 201)
})

export default app
