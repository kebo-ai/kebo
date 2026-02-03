import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, eq, sql } from "drizzle-orm"
import { accounts, accountTypes, transactions } from "@/db/schema"
import { authMiddleware } from "@/middleware"
import type { AppEnv } from "@/types/env"

// Credit card account type ID - balance is inverted for this type
const CREDIT_CARD_ACCOUNT_TYPE_ID = "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

const app = new OpenAPIHono<AppEnv>()

const AccountParamsSchema = z.object({
  id: z.string().uuid(),
})

const CreateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  customized_name: z.string().max(255).optional(),
  account_type_id: z.string().uuid(),
  bank_id: z.string().uuid(),
  balance: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .optional()
    .default("0"),
  icon_url: z.string().optional(),
  is_default: z.boolean().optional(),
})

// Routes
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Accounts"],
  summary: "List accounts",
  security: [{ Bearer: [] }],
  responses: { 200: { description: "List of accounts" } },
})

const getRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Accounts"],
  summary: "Get account by ID",
  security: [{ Bearer: [] }],
  request: { params: AccountParamsSchema },
  responses: { 200: { description: "Account details" } },
})

const withBalanceRoute = createRoute({
  method: "get",
  path: "/with-balance",
  tags: ["Accounts"],
  summary: "Get accounts with balances",
  security: [{ Bearer: [] }],
  responses: { 200: { description: "Accounts with balance" } },
})

const createAccountRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Accounts"],
  summary: "Create an account",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateAccountSchema } } },
  },
  responses: { 201: { description: "Account created" } },
})

const updateAccountRoute = createRoute({
  method: "put",
  path: "/:id",
  tags: ["Accounts"],
  summary: "Update an account",
  security: [{ Bearer: [] }],
  request: {
    params: AccountParamsSchema,
    body: {
      content: {
        "application/json": { schema: CreateAccountSchema.partial() },
      },
    },
  },
  responses: { 200: { description: "Account updated" } },
})

const deleteAccountRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Accounts"],
  summary: "Delete an account (soft delete)",
  security: [{ Bearer: [] }],
  request: { params: AccountParamsSchema },
  responses: { 200: { description: "Account deleted" } },
})

app.use("/*", authMiddleware)

app.openapi(listRoute, async (c) => {
  const userId = c.get("userId")
  const db = c.get("db")

  // Get accounts with calculated balance including transactions
  const result = await db
    .select({
      id: accounts.id,
      user_id: accounts.user_id,
      name: accounts.name,
      customized_name: accounts.customized_name,
      bank_id: accounts.bank_id,
      icon_url: accounts.icon_url,
      account_type_id: accounts.account_type_id,
      is_default: accounts.is_default,
      is_deleted: accounts.is_deleted,
      created_at: accounts.created_at,
      updated_at: accounts.updated_at,
      account_type: accountTypes.type_name,
      balance: sql<string>`
        CASE 
          WHEN ${accounts.account_type_id} = ${CREDIT_CARD_ACCOUNT_TYPE_ID}
          THEN ${accounts.balance} * -1
          ELSE ${accounts.balance}
        END
        + COALESCE((
          SELECT SUM(
            CASE 
              WHEN ${transactions.transaction_type} = 'Expense' THEN -1 * ${transactions.amount}
              ELSE ${transactions.amount}
            END
          )
          FROM ${transactions}
          WHERE ${transactions.account_id} = ${accounts.id}
            AND ${transactions.user_id} = ${userId}
            AND ${transactions.is_deleted} = false
        ), 0)
      `,
    })
    .from(accounts)
    .leftJoin(accountTypes, eq(accounts.account_type_id, accountTypes.id))
    .where(and(eq(accounts.user_id, userId), eq(accounts.is_deleted, false)))

  return c.json({ data: result }, 200)
})

app.openapi(getRoute, async (c) => {
  const userId = c.get("userId")
  const { id } = c.req.valid("param")
  const db = c.get("db")

  // Get account with calculated balance including transactions
  const [result] = await db
    .select({
      id: accounts.id,
      user_id: accounts.user_id,
      name: accounts.name,
      customized_name: accounts.customized_name,
      bank_id: accounts.bank_id,
      icon_url: accounts.icon_url,
      account_type_id: accounts.account_type_id,
      is_default: accounts.is_default,
      is_deleted: accounts.is_deleted,
      created_at: accounts.created_at,
      updated_at: accounts.updated_at,
      deleted_at: accounts.deleted_at,
      account_type: accountTypes.type_name,
      base_balance: accounts.balance,
      balance: sql<string>`
        CASE 
          WHEN ${accounts.account_type_id} = ${CREDIT_CARD_ACCOUNT_TYPE_ID}
          THEN ${accounts.balance} * -1
          ELSE ${accounts.balance}
        END
        + COALESCE((
          SELECT SUM(
            CASE 
              WHEN ${transactions.transaction_type} = 'Expense' THEN -1 * ${transactions.amount}
              ELSE ${transactions.amount}
            END
          )
          FROM ${transactions}
          WHERE ${transactions.account_id} = ${accounts.id}
            AND ${transactions.user_id} = ${userId}
            AND ${transactions.is_deleted} = false
        ), 0)
      `,
    })
    .from(accounts)
    .leftJoin(accountTypes, eq(accounts.account_type_id, accountTypes.id))
    .where(
      and(
        eq(accounts.id, id),
        eq(accounts.user_id, userId),
        eq(accounts.is_deleted, false),
      ),
    )

  if (!result) {
    return c.json({ error: "Account not found" }, 404)
  }
  return c.json(result, 200)
})

app.openapi(withBalanceRoute, async (c) => {
  const userId = c.get("userId")
  const db = c.get("db")

  // Replace user_balance_by_account_vw view with explicit Drizzle query
  // This calculates base balance + transactions total for each account
  const result = await db
    .select({
      account_id: accounts.id,
      account_name: accounts.name,
      customized_name: accounts.customized_name,
      account_type: accountTypes.description,
      icon_url: accounts.icon_url,
      base_balance: sql<string>`
        CASE 
          WHEN ${accounts.account_type_id} = ${CREDIT_CARD_ACCOUNT_TYPE_ID}
          THEN ${accounts.balance} * -1
          ELSE ${accounts.balance}
        END
      `,
      transactions_total: sql<string>`COALESCE(SUM(
        CASE 
          WHEN ${transactions.transaction_type} = 'Expense' THEN -1 * ${transactions.amount}
          ELSE ${transactions.amount}
        END
      ), 0)`,
      total_balance: sql<string>`
        CASE 
          WHEN ${accounts.account_type_id} = ${CREDIT_CARD_ACCOUNT_TYPE_ID}
          THEN ${accounts.balance} * -1
          ELSE ${accounts.balance}
        END
        + COALESCE(SUM(
          CASE 
            WHEN ${transactions.transaction_type} = 'Expense' THEN -1 * ${transactions.amount}
            ELSE ${transactions.amount}
          END
        ), 0)
      `,
    })
    .from(accounts)
    .leftJoin(
      transactions,
      and(
        eq(transactions.account_id, accounts.id),
        eq(transactions.user_id, userId),
        eq(transactions.is_deleted, false),
      ),
    )
    .leftJoin(accountTypes, eq(accounts.account_type_id, accountTypes.id))
    .where(and(eq(accounts.user_id, userId), eq(accounts.is_deleted, false)))
    .groupBy(accounts.id, accountTypes.description)

  return c.json({ data: result }, 200)
})

app.openapi(createAccountRoute, async (c) => {
  const userId = c.get("userId")
  const body = c.req.valid("json")
  const db = c.get("db")

  const [account] = await db
    .insert(accounts)
    .values({ ...body, user_id: userId })
    .returning()

  return c.json(account, 201)
})

app.openapi(updateAccountRoute, async (c) => {
  const userId = c.get("userId")
  const { id } = c.req.valid("param")
  const body = c.req.valid("json")
  const db = c.get("db")

  const [account] = await db
    .update(accounts)
    .set({ ...body, updated_at: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.user_id, userId)))
    .returning()

  if (!account) {
    return c.json({ error: "Account not found" }, 404)
  }
  return c.json(account, 200)
})

app.openapi(deleteAccountRoute, async (c) => {
  const userId = c.get("userId")
  const { id } = c.req.valid("param")
  const db = c.get("db")

  const [account] = await db
    .update(accounts)
    .set({ is_deleted: true, deleted_at: new Date(), updated_at: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.user_id, userId)))
    .returning()

  if (!account) {
    return c.json({ error: "Account not found" }, 404)
  }
  return c.json({ success: true }, 200)
})

export default app
