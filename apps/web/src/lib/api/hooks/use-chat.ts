"use client"

import { useState, useCallback } from "react"
import { useMutation } from "@tanstack/react-query"
import { api, streamChat, type StreamChatCallbacks } from "../client"
import type { ChatMessage, SendChatMessageInput } from "../types"

interface ChatResponse {
  message: ChatMessage
  conversation_id: string
}

/**
 * Hook for non-streaming chat (backward compatibility)
 */
export function useSendChatMessage() {
  return useMutation({
    mutationFn: (data: SendChatMessageInput) =>
      api.post<ChatResponse>("/ai/chat", data),
  })
}

/**
 * Hook for streaming chat with SSE
 */
export function useStreamChat() {
  const [isStreaming, setIsStreaming] = useState(false)

  const streamMessage = useCallback(
    async (
      message: string,
      conversationId: string | undefined,
      callbacks: StreamChatCallbacks,
    ) => {
      setIsStreaming(true)

      await streamChat(message, conversationId, {
        onChunk: callbacks.onChunk,
        onConversationId: callbacks.onConversationId,
        onDone: () => {
          setIsStreaming(false)
          callbacks.onDone()
        },
        onError: (error) => {
          setIsStreaming(false)
          callbacks.onError(error)
        },
      })
    },
    [],
  )

  return {
    streamMessage,
    isStreaming,
  }
}
