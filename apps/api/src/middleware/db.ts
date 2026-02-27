import { createMiddleware } from "hono/factory"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"
import type { AppEnv } from "@/types/env"

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const client = postgres(c.env.DATABASE_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: {
      statement_timeout: "15000" as unknown as number,
    },
  })
  const db = drizzle(client, { schema })
  c.set("db", db)
  try {
    await next()
  } finally {
    await client.end({ timeout: 0 }).catch(() => {})
  }
})
