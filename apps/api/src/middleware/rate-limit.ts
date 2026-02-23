import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createMiddleware } from "hono/factory"
import type { AppEnv } from "@/types/env"

function createRatelimiter(
  url: string,
  token: string,
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
) {
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter,
    analytics: true,
    prefix: "kebo-api",
  })
}

/**
 * General API rate limit: 60 requests per 60 seconds per user/IP.
 */
export const rateLimitMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const ratelimit = createRatelimiter(
    c.env.UPSTASH_REDIS_REST_URL,
    c.env.UPSTASH_REDIS_REST_TOKEN,
    Ratelimit.slidingWindow(60, "60 s"),
  )

  const userId = c.get("userId")
  const identifier =
    userId || c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "anonymous"

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier)

  c.header("X-RateLimit-Limit", limit.toString())
  c.header("X-RateLimit-Remaining", remaining.toString())
  c.header("X-RateLimit-Reset", reset.toString())

  if (!success) {
    return c.json({ error: "Too many requests" }, 429)
  }

  await next()
})

/**
 * Stricter rate limit for AI endpoints: 10 requests per 60 seconds.
 * These are expensive operations (LLM calls).
 */
export const aiRateLimitMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const ratelimit = createRatelimiter(
    c.env.UPSTASH_REDIS_REST_URL,
    c.env.UPSTASH_REDIS_REST_TOKEN,
    Ratelimit.slidingWindow(10, "60 s"),
  )

  const userId = c.get("userId")
  const identifier = `ai:${userId || "anonymous"}`

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier)

  c.header("X-RateLimit-Limit", limit.toString())
  c.header("X-RateLimit-Remaining", remaining.toString())
  c.header("X-RateLimit-Reset", reset.toString())

  if (!success) {
    return c.json({ error: "Too many requests. AI endpoints are rate limited." }, 429)
  }

  await next()
})

/**
 * Strict rate limit for admin endpoints: 5 requests per 60 seconds.
 */
export const adminRateLimitMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const ratelimit = createRatelimiter(
    c.env.UPSTASH_REDIS_REST_URL,
    c.env.UPSTASH_REDIS_REST_TOKEN,
    Ratelimit.slidingWindow(5, "60 s"),
  )

  const identifier =
    `admin:${c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "anonymous"}`

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier)

  c.header("X-RateLimit-Limit", limit.toString())
  c.header("X-RateLimit-Remaining", remaining.toString())
  c.header("X-RateLimit-Reset", reset.toString())

  if (!success) {
    return c.json({ error: "Too many requests" }, 429)
  }

  await next()
})
