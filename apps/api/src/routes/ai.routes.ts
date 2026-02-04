import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, desc, eq } from "drizzle-orm"
import { stream } from "hono/streaming"
import { aiReports, chatConversations, chatMessages } from "@/db/schema"
import { authMiddleware } from "@/middleware"
import { AIService } from "@/services/ai.service"
import type { AppEnv } from "@/types/env"

const app = new OpenAPIHono<AppEnv>()

// Schemas
const CreateReportSchema = z.object({
  message: z.record(z.unknown()),
  reportMessage: z.string(),
})

const ChatMessageSchema = z.object({
  message: z.string().min(1),
  conversation_id: z.string().uuid().optional(),
})

const ChatStreamSchema = z.object({
  message: z.string().min(1),
  conversation_id: z.string().uuid().optional(),
})

const ConversationListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})

// Route definitions
const createReportRoute = createRoute({
  method: "post",
  path: "/reports",
  tags: ["AI"],
  summary: "Create AI report",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateReportSchema } } },
  },
  responses: { 201: { description: "Report created" } },
})

const chatRoute = createRoute({
  method: "post",
  path: "/chat",
  tags: ["AI"],
  summary: "Send a chat message to Kebo Wise (non-streaming)",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: ChatMessageSchema } } },
  },
  responses: {
    200: { description: "Chat response" },
    500: { description: "AI service error" },
  },
})

const chatStreamRoute = createRoute({
  method: "post",
  path: "/chat/stream",
  tags: ["AI"],
  summary: "Stream a chat response from Kebo Wise",
  description: "Returns Server-Sent Events (SSE) stream with AI response",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: ChatStreamSchema } } },
  },
  responses: {
    200: {
      description: "SSE stream of chat response",
      content: { "text/event-stream": { schema: z.any() } },
    },
    500: { description: "AI service error" },
  },
})

const listConversationsRoute = createRoute({
  method: "get",
  path: "/conversations",
  tags: ["AI"],
  summary: "List user's chat conversations",
  security: [{ Bearer: [] }],
  request: {
    query: ConversationListSchema,
  },
  responses: {
    200: { description: "List of conversations" },
  },
})

const getConversationRoute = createRoute({
  method: "get",
  path: "/conversations/{id}",
  tags: ["AI"],
  summary: "Get conversation with messages",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: { description: "Conversation with messages" },
    404: { description: "Conversation not found" },
  },
})

// Apply auth middleware
app.use("/*", authMiddleware)

// Report creation (unchanged)
app.openapi(createReportRoute, async (c) => {
  const userId = c.get("userId")
  const body = c.req.valid("json")
  const db = c.get("db")

  const [report] = await db
    .insert(aiReports)
    .values({
      user_id: userId,
      message: body.message,
      report_message: body.reportMessage,
    })
    .returning()

  return c.json(report, 201)
})

// Non-streaming chat (for backward compatibility)
app.openapi(chatRoute, async (c) => {
  const userId = c.get("userId")
  const body = c.req.valid("json")
  const db = c.get("db")

  try {
    const { content, conversationId } = await AIService.chat({
      db,
      userId,
      message: body.message,
      conversationId: body.conversation_id,
      apiKey: c.env.AI_GATEWAY_API_KEY,
    })

    return c.json({
      message: {
        role: "assistant",
        content,
      },
      conversation_id: conversationId,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return c.json({ error: "AI service error" }, 500)
  }
})

// Streaming chat endpoint
app.openapi(chatStreamRoute, async (c) => {
  const userId = c.get("userId")
  const body = c.req.valid("json")
  const db = c.get("db")

  try {
    const { result, conversationId, saveResponse } = await AIService.streamChat(
      {
        db,
        userId,
        message: body.message,
        conversationId: body.conversation_id,
        apiKey: c.env.AI_GATEWAY_API_KEY,
      },
    )

    let fullResponse = ""

    // Return SSE stream
    return stream(c, async (stream) => {
      // Set headers for SSE
      c.header("Content-Type", "text/event-stream")
      c.header("Cache-Control", "no-cache")
      c.header("Connection", "keep-alive")

      // Send conversation_id first
      await stream.write(
        `data: ${JSON.stringify({ type: "conversation_id", conversation_id: conversationId })}\n\n`,
      )

      // Stream text chunks
      for await (const textPart of result.textStream) {
        fullResponse += textPart
        await stream.write(
          `data: ${JSON.stringify({ type: "text", content: textPart })}\n\n`,
        )
      }

      // Send done event
      await stream.write(`data: ${JSON.stringify({ type: "done" })}\n\n`)

      // Save complete response to database
      await saveResponse(fullResponse)
    })
  } catch (error) {
    console.error("Stream error:", error)
    return c.json({ error: "AI service error" }, 500)
  }
})

// List conversations
app.openapi(listConversationsRoute, async (c) => {
  const userId = c.get("userId")
  const { page, limit } = c.req.valid("query")
  const db = c.get("db")
  const offset = (page - 1) * limit

  const conversations = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.user_id, userId))
    .orderBy(desc(chatConversations.updated_at))
    .limit(limit)
    .offset(offset)

  return c.json({ conversations, page, limit })
})

// Get conversation with messages
app.openapi(getConversationRoute, async (c) => {
  const userId = c.get("userId")
  const { id } = c.req.valid("param")
  const db = c.get("db")

  const [conversation] = await db
    .select()
    .from(chatConversations)
    .where(
      and(eq(chatConversations.id, id), eq(chatConversations.user_id, userId)),
    )
    .limit(1)

  if (!conversation) {
    return c.json({ error: "Conversation not found" }, 404)
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversation_id, id))
    .orderBy(chatMessages.created_at)

  return c.json({ conversation, messages })
})

export default app
