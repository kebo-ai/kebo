import { createMiddleware } from "hono/factory"
import type { AppEnv } from "@/types/env"

export const loggerMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()

  c.set("requestId", requestId)

  console.log(
    JSON.stringify({
      type: "request",
      requestId,
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header("user-agent"),
    }),
  )

  await next()

  const duration = Date.now() - start

  console.log(
    JSON.stringify({
      type: "response",
      requestId,
      status: c.res.status,
      duration,
    }),
  )
})
