import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, eq, inArray } from "drizzle-orm"
import { authMiddleware } from "@/middleware"
import { TransactionService } from "@/services"
import { CategorizeService } from "@/services/categorize.service"
import { accounts, categories, banks } from "@/db/schema"
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

const app = base.openapi(quickCreateRoute, async (c) => {
  const userId = c.get("userId")
  const db = c.get("db")
  const body = c.req.valid("json")

  // Fetch categories and accounts in parallel
  const [userCategories, userAccounts] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        icon_emoji: categories.icon_emoji,
      })
      .from(categories)
      .where(
        and(
          eq(categories.user_id, userId),
          eq(categories.is_deleted, false),
          eq(categories.type, "Expense"),
        ),
      ),
    db
      .select({
        id: accounts.id,
        name: accounts.name,
        is_default: accounts.is_default,
        bank_id: accounts.bank_id,
      })
      .from(accounts)
      .where(
        and(eq(accounts.user_id, userId), eq(accounts.is_deleted, false)),
      ),
  ])

  if (userAccounts.length === 0) {
    return c.json(
      { error: "No account found. Please create an account first." },
      404,
    )
  }

  // Resolve bank names
  const bankIds = [...new Set(userAccounts.map((a) => a.bank_id))]
  const bankRows =
    bankIds.length > 0
      ? await db
          .select({ id: banks.id, name: banks.name })
          .from(banks)
          .where(inArray(banks.id, bankIds))
      : []
  const bankMap = new Map(bankRows.map((b) => [b.id, b.name]))

  const accountsWithBanks = userAccounts.map((a) => ({
    ...a,
    bank_name: bankMap.get(a.bank_id) ?? null,
  }))
  const defaultAccount =
    accountsWithBanks.find((a) => a.is_default) || accountsWithBanks[0]

  // AI categorization
  let categoryId: string | undefined
  let accountId = defaultAccount.id
  let description = body.merchant
  let categorized = false

  if (c.env.AI_GATEWAY_API_KEY && userCategories.length > 0) {
    const service = new CategorizeService(c.env.AI_GATEWAY_API_KEY)
    const result = await service.categorize({
      merchant: body.merchant,
      transactionName: body.transaction_name,
      cardName: body.card_name,
      amount: body.amount,
      currency: body.currency,
      categories: userCategories.map((cat) => ({
        id: cat.id,
        name: cat.name ?? "",
        icon_emoji: cat.icon_emoji,
      })),
      accounts: accountsWithBanks.map((a) => ({
        id: a.id,
        name: a.name,
        bank_name: a.bank_name,
      })),
    })

    if (result) {
      categoryId = result.category_id
      description = result.description || body.merchant
      const accValid = accountsWithBanks.some(
        (a) => a.id === result.account_id,
      )
      accountId = accValid ? result.account_id : defaultAccount.id
      categorized = true
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
})

export default app
