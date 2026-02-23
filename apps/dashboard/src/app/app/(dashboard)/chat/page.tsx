"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Send, Bot, User, Sparkles } from "lucide-react"

import { useStreamChat } from "@/lib/api/hooks/use-chat"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

const SAMPLE_QUESTIONS = [
  "How are my finances doing this month?",
  "What category am I spending the most on?",
  "Give me tips to save more money",
  "How much did I spend on food last month?",
  "What's my average daily spending?",
  "How can I reduce my expenses?",
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-dash-accent text-white"
            : "bg-dash-card-hover text-dash-text-muted"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-dash-accent text-white rounded-tr-sm"
            : "bg-dash-card rounded-tl-sm border border-dash-border text-dash-text"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse" />
          )}
        </p>
        {!message.isStreaming && (
          <p
            className={cn(
              "text-[10px] mt-1",
              isUser ? "text-white/70" : "text-dash-text-dim"
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  )
}

function SampleQuestions({
  onSelect,
}: {
  onSelect: (question: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kebo-500/20 to-kebo-600/20 flex items-center justify-center mb-4">
        <Sparkles className="h-8 w-8 text-kebo-400" />
      </div>
      <h2 className="text-xl font-semibold text-dash-text mb-2">Kebo Wise</h2>
      <p className="text-dash-text-muted text-center mb-6 max-w-md">
        Your AI-powered financial assistant. Ask me anything about your
        finances!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {SAMPLE_QUESTIONS.map((question) => (
          <button
            key={question}
            onClick={() => onSelect(question)}
            className="h-auto py-3 px-4 text-left justify-start whitespace-normal dash-card hover:bg-dash-card-hover transition-colors text-dash-text-secondary text-sm"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const searchParams = useSearchParams()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasHandledInitialQuestion = useRef(false)

  const { streamMessage, isStreaming } = useStreamChat()

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      const assistantMessageId = `assistant-${Date.now()}`

      // Add user message and empty assistant message for streaming
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ])
      setInput("")

      await streamMessage(content.trim(), conversationId || undefined, {
        onChunk: (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        },
        onConversationId: (id: string) => {
          setConversationId(id)
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false, timestamp: new Date() }
                : msg
            )
          )
        },
        onError: (error: string) => {
          console.error("Chat error:", error)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content:
                      "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                    isStreaming: false,
                    timestamp: new Date(),
                  }
                : msg
            )
          )
        },
      })
    },
    [conversationId, isStreaming, streamMessage]
  )

  // Handle initial question from URL
  useEffect(() => {
    const initialQuestion = searchParams.get("q")
    if (
      initialQuestion &&
      messages.length === 0 &&
      !hasHandledInitialQuestion.current
    ) {
      hasHandledInitialQuestion.current = true
      handleSendMessage(initialQuestion)
    }
  }, [searchParams, messages.length, handleSendMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  const handleSelectQuestion = (question: string) => {
    handleSendMessage(question)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-dash-border">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kebo-500 to-kebo-600 flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-dash-text">Kebo Wise</h1>
          <p className="text-sm text-dash-text-muted">
            Your AI financial assistant
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 py-4 overflow-y-auto">
        {messages.length === 0 ? (
          <SampleQuestions onSelect={handleSelectQuestion} />
        ) : (
          <div className="space-y-4 px-1">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="pt-4 border-t border-dash-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            disabled={isStreaming}
            className="dash-input flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-3 rounded-lg bg-dash-accent text-white hover:bg-dash-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
