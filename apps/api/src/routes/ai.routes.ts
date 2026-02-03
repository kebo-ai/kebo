import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, desc, eq } from "drizzle-orm"
import { aiReports, chatConversations, chatMessages } from "@/db/schema"
import { authMiddleware } from "@/middleware"
import type { AppEnv } from "@/types/env"

const app = new OpenAPIHono<AppEnv>()

const CreateReportSchema = z.object({
  message: z.record(z.unknown()),
  reportMessage: z.string(),
})

const ChatMessageSchema = z.object({
  message: z.string().min(1),
  conversation_id: z.string().uuid().optional(),
})

// Routes
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
  summary: "Send a chat message to Kebo Wise",
  security: [{ Bearer: [] }],
  request: {
    body: { content: { "application/json": { schema: ChatMessageSchema } } },
  },
  responses: {
    200: { description: "Chat response" },
    500: { description: "AI service error" },
  },
})

app.use("/*", authMiddleware)

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

app.openapi(chatRoute, async (c) => {
  const userId = c.get("userId")
  const body = c.req.valid("json")
  const db = c.get("db")

  let conversationId = body.conversation_id

  // Create or get conversation
  if (!conversationId) {
    const [conversation] = await db
      .insert(chatConversations)
      .values({
        user_id: userId,
        title: body.message.substring(0, 50),
      })
      .returning()
    conversationId = conversation.id
  }

  // Save user message
  const [userMessage] = await db
    .insert(chatMessages)
    .values({
      conversation_id: conversationId,
      role: "user",
      content: body.message,
    })
    .returning()

  // Generate AI response
  // TODO: Integrate with actual AI service (OpenAI, Anthropic, etc.)
  // For now, return a placeholder response
  const aiResponse = generatePlaceholderResponse(body.message)

  // Save assistant message
  const [assistantMessage] = await db
    .insert(chatMessages)
    .values({
      conversation_id: conversationId,
      role: "assistant",
      content: aiResponse,
    })
    .returning()

  return c.json(
    {
      message: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        created_at: assistantMessage.created_at,
      },
      conversation_id: conversationId,
    },
    200,
  )
})

// Placeholder response generator until AI integration is complete
function generatePlaceholderResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes("finances") || lowerMessage.includes("doing")) {
    return "Based on your recent transactions, you're doing well! Your spending is within budget for most categories. Keep up the good financial habits!"
  }

  if (lowerMessage.includes("spending") || lowerMessage.includes("category")) {
    return "Looking at your expenses, food and dining tends to be your largest spending category. Consider meal planning or cooking more at home to reduce this expense."
  }

  if (lowerMessage.includes("save") || lowerMessage.includes("tips")) {
    return "Here are some tips to save more:\n\n1. Set up automatic transfers to savings\n2. Review subscriptions monthly\n3. Use the 50/30/20 budgeting rule\n4. Track every expense in Kebo\n5. Set specific savings goals"
  }

  if (lowerMessage.includes("food") || lowerMessage.includes("groceries")) {
    return "Your food spending shows some interesting patterns. You might save by planning meals ahead and reducing dining out. Would you like me to analyze specific food categories?"
  }

  if (lowerMessage.includes("average") || lowerMessage.includes("daily")) {
    return "To calculate your average daily spending, I'd need to analyze your transaction history. Based on typical patterns, try to keep daily discretionary spending under $50 for better savings."
  }

  if (lowerMessage.includes("reduce") || lowerMessage.includes("cut")) {
    return "To reduce expenses, start by identifying your top 3 spending categories. Often the biggest opportunities are in dining out, subscriptions, and impulse purchases. Would you like specific suggestions?"
  }

  return "I'm here to help with your financial questions! You can ask me about your spending patterns, savings tips, budget analysis, or any other financial topic. What would you like to know?"
}

export default app
