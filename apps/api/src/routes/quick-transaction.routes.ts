import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { authMiddleware } from "@/middleware"
import { TransactionService } from "@/services"
import { CategorizeService } from "@/services/categorize.service"
import { fetchUserFinancialContext } from "@/services/user-context.service"
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
  date: z.string().optional(),
  transaction_name: z.string().max(500).optional(),
  card_name: z.string().max(500).optional(),
})

const quickCreateRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Transactions"],
  summary: "Quick-create a transaction from Apple Pay Shortcut",
  description:
    "Endpoint for iOS Shortcuts automation. Auto-categorizes using AI and picks the best account.",
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

const app = base.openapi(
  quickCreateRoute,
  async (c) => {
    const userId = c.get("userId")
    const db = c.get("db")
    const body = c.req.valid("json")

    // Single call: fetch all user context (categories + accounts with bank names)
    const ctx = await fetchUserFinancialContext(db, userId, {
      categoryType: "Expense",
    })

    if (ctx.accounts.length === 0) {
      return c.json(
        { error: "No account found. Please create an account first." },
        404,
      )
    }

    const defaultAccount =
      ctx.accounts.find((a) => a.is_default) || ctx.accounts[0]

    // AI categorization via Groq
    let categoryId: string | undefined
    let accountId = defaultAccount.id
    let description = body.merchant
    let categorized = false

    if (c.env.GROQ_API_KEY && ctx.categories.length > 0) {
      const service = new CategorizeService(c.env.GROQ_API_KEY)
      const result = await service.categorize(
        {
          merchant: body.merchant,
          transactionName: body.transaction_name,
          cardName: body.card_name,
          amount: body.amount,
          currency: body.currency,
        },
        ctx,
      )

      if (result) {
        const catValid = ctx.categories.some(
          (c) => c.id === result.category_id,
        )
        const accValid = ctx.accounts.some(
          (a) => a.id === result.account_id,
        )
        if (catValid) {
          categoryId = result.category_id
          description = result.description || body.merchant
          accountId = accValid ? result.account_id : defaultAccount.id
          categorized = true
        }
      }
    }

    const transaction = await TransactionService.create(db, userId, {
      account_id: accountId,
      transaction_type: "Expense",
      amount: body.amount,
      currency: body.currency,
      description,
      category_id: categoryId,
      date: body.date ? new Date(body.date) : new Date(),
      metadata: {
        source: "apple_pay_shortcut",
        merchant: body.merchant,
        transaction_name: body.transaction_name,
        card_name: body.card_name,
        pending: true,
        categorized,
      },
    })

    return c.json({ id: transaction.id, status: "ok", categorized }, 201)
  },
  (result, c) => {
    if (!result.success) {
      console.error(
        "[quick-transaction] validation error:",
        JSON.stringify(result.error.flatten()),
      )
      return c.json({ error: result.error.flatten() }, 400)
    }
  },
)

export default app
