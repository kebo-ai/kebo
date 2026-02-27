import { OpenAPIHono } from "@hono/zod-openapi"
import { sql } from "drizzle-orm"
import { apiReference } from "@scalar/hono-api-reference"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import {
  authMiddleware,
  dbMiddleware,
  errorHandler,
  loggerMiddleware,
  rateLimitMiddleware,
  defaultBodyLimit,
} from "@/middleware"
import { registerRoutes } from "@/routes"
import type { AppEnv } from "@/types/env"

export function createApp() {
  const app = new OpenAPIHono<AppEnv>()

  // Global middleware
  app.use("*", secureHeaders())
  app.use("*", loggerMiddleware)
  app.use(
    "*",
    cors({
      origin: [
        "https://kebo.app",
        "https://my.kebo.app",
        "http://localhost:3000",
        "http://localhost:8081",
      ],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["X-Request-Id"],
      maxAge: 86400,
      credentials: true,
    }),
  )

  // Body size limit (1MB for all routes by default)
  app.use("*", defaultBodyLimit)

  // Global rate limiting (60 req/min per user or IP)
  app.use("*", rateLimitMiddleware)

  // Database initialization middleware
  app.use("*", dbMiddleware)

  // Error handler
  app.onError(errorHandler)

  // Health check
  app.get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() }),
  )

  // DEBUG: bare POST test - no auth, no body parsing
  app.post("/debug-post", (c) => {
    console.log("[debug-post] handler reached")
    return c.json({ status: "post_works", timestamp: new Date().toISOString() })
  })

  // DEBUG: POST with auth but no body parsing/DB
  app.post("/debug-post-auth", authMiddleware, (c) => {
    console.log("[debug-post-auth] handler reached, userId:", c.get("userId"))
    return c.json({ status: "auth_post_works", userId: c.get("userId") })
  })

  // DEBUG: POST with auth + manual body reading + DB insert
  app.post("/debug-post-insert", authMiddleware, async (c) => {
    console.log("[debug-insert] reading body")
    const body = await c.req.json()
    console.log("[debug-insert] body:", body.description)
    const db = c.get("db")
    console.log("[debug-insert] got db, inserting...")
    const result = await db.execute(
      sql`INSERT INTO transactions (user_id, account_id, amount, currency, transaction_type, date, description, category_id)
          VALUES (${c.get("userId")}, ${body.account_id}, ${body.amount}, ${body.currency}, ${body.transaction_type}, ${body.date}, ${body.description}, ${body.category_id})
          RETURNING id, description`
    )
    console.log("[debug-insert] done:", result)
    return c.json({ status: "insert_works", result })
  })

  // Register API routes — capture return for RPC type inference
  const appWithRoutes = registerRoutes(app)

  // OpenAPI documentation (imperative on app — doesn't affect RPC types)
  appWithRoutes.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "Kebo API",
      version: "1.0.0",
      description: "Personal finance management API for the Kebo mobile app",
    },
    servers: [
      { url: "https://api.kebo.app", description: "Production" },
      { url: "http://localhost:8787", description: "Local development" },
    ],
    security: [{ Bearer: [] }],
  })

  // Register security scheme
  appWithRoutes.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Supabase JWT token from the mobile app",
  })

  // Scalar API reference UI
  appWithRoutes.get(
    "/docs",
    apiReference({
      spec: {
        url: "/openapi.json",
      },
      theme: "kepler",
      layout: "modern",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
      metaData: {
        title: "Kebo API Documentation",
      },
    }),
  )

  return appWithRoutes
}

export type AppType = ReturnType<typeof createApp>
