import { createMiddleware } from "hono/factory"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres, { type Sql } from "postgres"
import * as schema from "@/db/schema"
import type { AppEnv } from "@/types/env"

/**
 * Decode a JWT payload without verifying the signature.
 * Used only to extract claims for Supabase RLS context —
 * actual auth verification happens in authMiddleware.
 */
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payloadB64] = token.split(".")
    if (!payloadB64) return null
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/")
    const padding = "=".repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(base64 + padding))
  } catch {
    return null
  }
}

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

  // Extract JWT claims for Supabase RLS context.
  // Decoded (not verified) here — authMiddleware handles proper verification.
  const authHeader = c.req.header("Authorization")
  const payload = authHeader?.startsWith("Bearer ")
    ? decodeJWTPayload(authHeader.substring(7))
    : null

  try {
    if (payload?.sub) {
      // Wrap the entire request in a transaction so the pooler (Supavisor
      // in transaction mode, port 6543) pins a single backend connection.
      // This guarantees set_config + SET ROLE + all queries share the same
      // connection and the RLS context is preserved.
      // TransactionSql is runtime-compatible with Sql but typed differently,
      // so we cast to keep drizzle happy.
      await client.begin(async (tx) => {
        const sql = tx as unknown as Sql
        await sql`SELECT set_config('request.jwt.claims', ${JSON.stringify(payload)}, true)`
        await sql`SET LOCAL ROLE authenticated`
        const db = drizzle(sql, { schema })
        c.set("db", db)
        await next()
      })
    } else {
      // No auth token (e.g. /health) — no RLS context needed
      const db = drizzle(client, { schema })
      c.set("db", db)
      await next()
    }
  } finally {
    await client.end({ timeout: 5 }).catch(() => {})
  }
})
