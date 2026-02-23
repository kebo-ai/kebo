import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import { drizzle } from "drizzle-orm/postgres-js"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import postgres from "postgres"
import * as schema from "@/db/schema"
import {
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
  app.use("*", async (c, next) => {
    const client = postgres(c.env.DATABASE_URL, {
      prepare: false, // Required for Cloudflare Workers
      max: 1, // Single connection per request
    })
    const db = drizzle(client, { schema })
    c.set("db", db)
    await next()
    await client.end()
  })

  // Error handler
  app.onError(errorHandler)

  // Health check
  app.get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() }),
  )

  // Register API routes
  registerRoutes(app)

  // OpenAPI documentation
  app.doc("/openapi.json", {
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
  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Supabase JWT token from the mobile app",
  })

  // Scalar API reference UI
  app.get(
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

  return app
}
