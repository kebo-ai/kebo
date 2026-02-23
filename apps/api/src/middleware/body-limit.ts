import { bodyLimit } from "hono/body-limit"

/**
 * Default body size limit: 1MB for standard JSON endpoints.
 */
export const defaultBodyLimit = bodyLimit({
  maxSize: 1024 * 1024, // 1MB
  onError: (c) => {
    return c.json({ error: "Request body too large. Maximum size is 1MB." }, 413)
  },
})

/**
 * Larger body size limit: 5MB for admin ingestion endpoints.
 */
export const adminBodyLimit = bodyLimit({
  maxSize: 5 * 1024 * 1024, // 5MB
  onError: (c) => {
    return c.json({ error: "Request body too large. Maximum size is 5MB." }, 413)
  },
})
