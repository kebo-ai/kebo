import { hc } from "hono/client"
import type { AppType } from "@kebo/api/app"
import { getAccessToken, ApiError } from "./client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"

function createTypedClient(baseUrl: string) {
  return hc<AppType>(baseUrl, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = await getAccessToken()
      const headers = new Headers(init?.headers)
      if (token) headers.set("Authorization", `Bearer ${token}`)
      return fetch(input, { ...init, headers })
    },
  })
}

export type ApiClient = ReturnType<typeof createTypedClient>

// Singleton for browser use
let client: ApiClient | null = null
export function getApiClient(): ApiClient {
  if (!client) client = createTypedClient(API_BASE_URL)
  return client
}

/**
 * Helper to handle RPC response - throws ApiError for non-ok responses.
 * Pass an explicit type parameter for response typing until response schemas
 * are added to API routes (which will enable automatic inference).
 */
export async function unwrap<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = await response.text()
    }
    throw new ApiError(response.status, data)
  }
  return response.json() as Promise<T>
}
