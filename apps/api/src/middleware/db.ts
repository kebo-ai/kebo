import { createMiddleware } from "hono/factory"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"
import type { AppEnv } from "@/types/env"

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  console.log("[db] v3 creating connection")
  const client = postgres(c.env.DATABASE_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  })
  const db = drizzle(client, { schema })
  c.set("db", db)
  console.log("[db] v3 calling next()")
  await next()
  console.log("[db] v3 next() returned, closing connection")
  await client.end({ timeout: 0 })
  console.log("[db] v3 connection closed")
})
