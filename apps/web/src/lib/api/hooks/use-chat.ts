"use client"

import { useMutation } from "@tanstack/react-query"
import { api } from "../client"
import type { ChatMessage, SendChatMessageInput } from "../types"

interface ChatResponse {
  message: ChatMessage
  conversation_id: string
}

export function useSendChatMessage() {
  return useMutation({
    mutationFn: (data: SendChatMessageInput) =>
      api.post<ChatResponse>("/ai/chat", data),
  })
}
