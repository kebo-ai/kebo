import { sql as rawSql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import { createMiddleware } from "hono/factory"
import postgres from "postgres"
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
  const db = drizzle(client, { schema })

  // Extract JWT claims for Supabase RLS context.
  // Decoded (not verified) here — authMiddleware handles proper verification.
  const authHeader = c.req.header("Authorization")
  const payload = authHeader?.startsWith("Bearer ")
    ? decodeJWTPayload(authHeader.substring(7))
    : null

  try {
    if (payload?.sub) {
      // Wrap the entire request in a drizzle transaction so the pooler
      // (Supavisor in transaction mode, port 6543) pins a single backend
      // connection. This guarantees set_config + SET ROLE + all route
      // queries share the same connection and the RLS context is preserved.
      await db.transaction(async (tx) => {
        await tx.execute(
          rawSql`SELECT set_config('request.jwt.claims', ${JSON.stringify(payload)}, true)`,
        )
        await tx.execute(rawSql`SET LOCAL ROLE authenticated`)
        c.set("db", tx as unknown as typeof db)
        await next()
      })
    } else {
      // No auth token (e.g. /health) — no RLS context needed
      c.set("db", db)
      await next()
    }
  } finally {
    await client.end({ timeout: 5 }).catch(() => {})
  }
})
