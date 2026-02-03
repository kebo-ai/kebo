import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, eq, ilike, or } from "drizzle-orm"
import { banks } from "@/db/schema"
import { optionalAuthMiddleware } from "@/middleware"
import type { AppEnv } from "@/types/env"

const app = new OpenAPIHono<AppEnv>()

const CountryParamsSchema = z.object({
  code: z.string().length(2).toUpperCase(),
})

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  country: z.string().length(2).toUpperCase().optional(),
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

app.use("/*", optionalAuthMiddleware)

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

export default app
