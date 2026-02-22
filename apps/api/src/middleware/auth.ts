import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "@/types/env"

interface JWTPayload {
  sub: string
  email?: string
  exp?: number
  iat?: number
  aud?: string
  role?: string
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  return atob(base64 + padding)
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  const parts = token.split(".")
  if (parts.length !== 3) {
    throw new Error("Invalid token format")
  }

  const [headerB64, payloadB64, signatureB64] = parts

  // Decode payload
  const payload = JSON.parse(base64UrlDecode(payloadB64)) as JWTPayload

  // Verify signature using Web Crypto API
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  )

  const signature = Uint8Array.from(base64UrlDecode(signatureB64), (c) =>
    c.charCodeAt(0),
  )
  const data = encoder.encode(`${headerB64}.${payloadB64}`)

  const isValid = await crypto.subtle.verify("HMAC", key, signature, data)

  if (!isValid) {
    throw new Error("Invalid signature")
  }

  return payload
}

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      message: "Missing or invalid authorization header",
    })
  }

  const token = authHeader.substring(7)

  try {
    const payload = await verifyJWT(token, c.env.SUPABASE_JWT_SECRET)

    if (!payload.sub) {
      throw new HTTPException(401, {
        message: "Invalid token: missing subject",
      })
    }

    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new HTTPException(401, { message: "Token expired" })
    }

    c.set("userId", payload.sub)
    c.set("userEmail", payload.email)

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    throw new HTTPException(401, { message: "Invalid token" })
  }
})

export const optionalAuthMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization")

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const payload = await verifyJWT(token, c.env.SUPABASE_JWT_SECRET)
        if (payload.sub) {
          c.set("userId", payload.sub)
          c.set("userEmail", payload.email)
        }
      } catch {
        // Ignore invalid tokens for optional auth
      }
    }

    await next()
  },
)
