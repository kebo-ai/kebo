import { createClient } from "@/lib/auth/client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(`API Error: ${status}`)
    this.status = status
    this.data = data
  }
}

export async function getAccessToken(): Promise<string | undefined> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers as Record<string, string>,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
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

  // Handle empty responses
  const contentType = response.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return response.json()
  }

  return {} as T
}

// Helper methods for common HTTP methods
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: "DELETE" }),
}

// Streaming chat interface
export interface StreamChatCallbacks {
  onChunk: (chunk: string) => void
  onConversationId?: (id: string) => void
  onDone: () => void
  onError: (error: string) => void
}

/**
 * Stream chat messages from the AI endpoint via SSE
 */
export async function streamChat(
  message: string,
  conversationId: string | undefined,
  callbacks: StreamChatCallbacks,
): Promise<void> {
  const token = await getAccessToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      callbacks.onError(`API Error: ${response.status} - ${errorText}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError("No response stream available")
      return
    }

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6))

            switch (data.type) {
              case "conversation_id":
                callbacks.onConversationId?.(data.conversation_id)
                break
              case "text":
                callbacks.onChunk(data.content)
                break
              case "done":
                callbacks.onDone()
                break
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e)
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError(
      error instanceof Error ? error.message : "Stream connection failed",
    )
  }
}
