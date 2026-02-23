import type { ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "@/types/env"

interface PostgresError {
  code?: string
  message?: string
}

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  console.error("Error:", err)

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    return c.json(
      {
        error: "Validation error",
        details: (err as unknown as { issues: unknown[] }).issues,
      },
      400,
    )
  }

  // Handle HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
      },
      err.status,
    )
  }

  // Handle database errors
  const pgError = err as PostgresError
  if (pgError.code === "23505") {
    return c.json(
      {
        error: "Resource already exists",
      },
      409,
    )
  }

  if (pgError.code === "23503") {
    return c.json(
      {
        error: "Referenced resource not found",
      },
      400,
    )
  }

  // Generic server error
  return c.json(
    {
      error:
        c.env.ENVIRONMENT === "development"
          ? (err as Error).message
          : "Internal server error",
    },
    500,
  )
}
