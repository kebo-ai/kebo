import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, eq, ilike, or } from "drizzle-orm"
import { banks } from "@/db/schema"
import { authMiddleware } from "@/middleware"
import type { AppEnv } from "@/types/env"

const app = new OpenAPIHono<AppEnv>()

const BankParamsSchema = z.object({
  id: z.string().uuid(),
})

const CountryParamsSchema = z.object({
  code: z.string().length(2).toUpperCase(),
})

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  country: z.string().length(2).toUpperCase().optional(),
})

const CreateBankSchema = z.object({
  name: z.string().min(1).max(255),
  country_code: z.string().max(10).optional(),
  open_finance_integrated: z.boolean().optional(),
  bank_url: z.string().max(255).optional(),
  description: z.string().max(255).optional(),
  country_flag: z.string().max(10).optional(),
})

// Routes
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Banks"],
  summary: "List all banks",
  responses: { 200: { description: "List of banks" } },
})

const searchRoute = createRoute({
  method: "get",
  path: "/search",
  tags: ["Banks"],
  summary: "Search banks by name",
  request: { query: SearchQuerySchema },
  responses: { 200: { description: "Search results" } },
})

const byCountryRoute = createRoute({
  method: "get",
  path: "/country/:code",
  tags: ["Banks"],
  summary: "Get banks by country",
  request: { params: CountryParamsSchema },
  responses: { 200: { description: "Banks in country" } },
})

const getBankRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Banks"],
  summary: "Get a bank by ID",
  request: { params: BankParamsSchema },
  responses: {
    200: { description: "Bank details" },
    404: { description: "Bank not found" },
  },
})

const createBankRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Banks"],
  summary: "Create a bank",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateBankSchema } } },
  },
  responses: {
    201: { description: "Bank created" },
    409: { description: "Bank with this name already exists" },
  },
})

const updateBankRoute = createRoute({
  method: "put",
  path: "/:id",
  tags: ["Banks"],
  summary: "Update a bank",
  security: [{ Bearer: [] }],
  request: {
    params: BankParamsSchema,
    body: {
      content: {
        "application/json": { schema: CreateBankSchema.partial() },
      },
    },
  },
  responses: {
    200: { description: "Bank updated" },
    404: { description: "Bank not found" },
  },
})

const deleteBankRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Banks"],
  summary: "Delete a bank (soft delete)",
  security: [{ Bearer: [] }],
  request: { params: BankParamsSchema },
  responses: {
    200: { description: "Bank deleted" },
    404: { description: "Bank not found" },
  },
})

// All bank routes require authentication
app.use("/*", authMiddleware)

app.openapi(listRoute, async (c) => {
  const db = c.get("db")

  const result = await db
    .select()
    .from(banks)
    .where(eq(banks.is_deleted, false))

  return c.json({ data: result }, 200)
})

app.openapi(searchRoute, async (c) => {
  const { q, country } = c.req.valid("query")
  const db = c.get("db")

  const conditions = [eq(banks.is_deleted, false), ilike(banks.name, `%${q}%`)]

  if (country) {
    conditions.push(
      or(eq(banks.country_code, country), eq(banks.country_code, "GLOBAL"))!,
    )
  }

  const result = await db
    .select()
    .from(banks)
    .where(and(...conditions))
    .limit(20)

  return c.json({ data: result }, 200)
})

app.openapi(byCountryRoute, async (c) => {
  const { code } = c.req.valid("param")
  const db = c.get("db")

  const result = await db
    .select()
    .from(banks)
    .where(
      and(
        eq(banks.is_deleted, false),
        or(eq(banks.country_code, code), eq(banks.country_code, "GLOBAL")),
      ),
    )

  return c.json({ data: result }, 200)
})

app.openapi(getBankRoute, async (c) => {
  const { id } = c.req.valid("param")
  const db = c.get("db")

  const [bank] = await db
    .select()
    .from(banks)
    .where(and(eq(banks.id, id), eq(banks.is_deleted, false)))

  if (!bank) {
    return c.json({ error: "Bank not found" }, 404)
  }

  return c.json({ data: bank }, 200)
})

app.openapi(createBankRoute, async (c) => {
  const body = c.req.valid("json")
  const db = c.get("db")

  try {
    const [bank] = await db.insert(banks).values(body).returning()

    return c.json({ data: bank }, 201)
  } catch (error: unknown) {
    // Handle unique constraint violation on name
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return c.json({ error: "Bank with this name already exists" }, 409)
    }
    throw error
  }
})

app.openapi(updateBankRoute, async (c) => {
  const { id } = c.req.valid("param")
  const body = c.req.valid("json")
  const db = c.get("db")

  const [bank] = await db
    .update(banks)
    .set({ ...body, updated_at: new Date() })
    .where(and(eq(banks.id, id), eq(banks.is_deleted, false)))
    .returning()

  if (!bank) {
    return c.json({ error: "Bank not found" }, 404)
  }

  return c.json({ data: bank }, 200)
})

app.openapi(deleteBankRoute, async (c) => {
  const { id } = c.req.valid("param")
  const db = c.get("db")

  const [bank] = await db
    .update(banks)
    .set({ is_deleted: true, deleted_at: new Date(), updated_at: new Date() })
    .where(and(eq(banks.id, id), eq(banks.is_deleted, false)))
    .returning()

  if (!bank) {
    return c.json({ error: "Bank not found" }, 404)
  }

  return c.json({ success: true }, 200)
})

export default app
