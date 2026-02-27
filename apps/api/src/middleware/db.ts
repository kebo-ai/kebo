import { createMiddleware } from "hono/factory"
import { drizzle } from "drizzle-orm/postgres-js"
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
  c.set("db", db)

  // Set Supabase RLS context so auth.uid() works for INSERT/UPDATE/DELETE policies.
  // The JWT is decoded (not verified) here — authMiddleware handles proper verification.
  const authHeader = c.req.header("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const payload = decodeJWTPayload(authHeader.substring(7))
    if (payload?.sub) {
      await client`SELECT set_config('request.jwt.claims', ${JSON.stringify(payload)}, false)`
      await client`SET ROLE authenticated`
    }
  }

  try {
    await next()
  } finally {
    await client.end({ timeout: 5 }).catch(() => {})
  }
})
