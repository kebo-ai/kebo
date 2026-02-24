import { ApiError } from "./client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"

export function createServerApi(token: string) {
  async function serverFetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      let data: unknown
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }
      throw new ApiError(response.status, data)
    }

    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      return response.json()
    }

    return {} as T
  }

  return {
    get: <T>(endpoint: string) => serverFetch<T>(endpoint),
  }
}
