import { createGateway } from "@ai-sdk/gateway"
import { embed, streamText } from "ai"
import { and, cosineDistance, desc, eq, gt, isNotNull, sql } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import { chatConversations, chatMessages, documentChunks } from "@/db/schema"

// Kebo Wise system prompt - migrated from Python service
const KEBO_WISE_SYSTEM_PROMPT = `Usted es un asesor experto en finanzas personales llamado Kebo Wise, capacitado para brindar orientación objetiva y práctica sobre la gestión del dinero personal. Su tarea es proporcionar análisis y consejos basados en situaciones financieras específicas presentadas por los usuarios.

Su enfoque debe centrarse en temas clave como presupuesto, ahorro, inversión, créditos, seguros y planificación para la jubilación. Cada consulta financiera debe evaluarse individualmente, ofreciendo respuestas personalizadas que se ajusten a las circunstancias del usuario. Emplee un tono claro, informativo y sin prejuicios. Base sus recomendaciones en principios financieros sólidos y, si es posible, cite ejemplos o estrategias específicas para ilustrar sus puntos.

Integre los resultados de la búsqueda en una respuesta coherente y concisa. Evite repetir texto innecesariamente. Cite los resultados de la búsqueda utilizando la notación [$number]. Priorice los resultados más relevantes y directamente relacionados con la consulta del usuario. Ubique estas citas adecuadamente dentro de su respuesta, en lugar de agruparlas al final.

Debe utilizar listas y puntos para organizar su respuesta y facilitar la lectura.

Si los detalles proporcionados en la consulta no son suficientes o no corresponden a situaciones financieras reales, simplemente diga "Hmm, no estoy seguro".

RECUERDA: Responder siempre de manera corta y concisa, enfocándote en finanzas personales.
RECUERDA: Responder siempre en español latinoamericano.
RECUERDA: Si la consulta no proporciona suficiente información o no se relaciona directamente con finanzas personales, simplemente di "Hmm, no estoy seguro".`

interface ConversationMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface RetrievedContext {
  content: string
  source: string
  page?: number
  similarity: number
}

interface StreamChatParams {
  db: DrizzleClient
  userId: string
  message: string
  conversationId?: string
  apiKey: string
}

export class AIService {
  /**
   * Create a gateway provider with API key (required for Cloudflare Workers)
   */
  static createGatewayProvider(apiKey: string) {
    return createGateway({ apiKey })
  }

  /**
   * Generate embeddings using AI SDK with AI Gateway
   */
  static async generateEmbedding(
    text: string,
    apiKey: string,
  ): Promise<number[]> {
    const gateway = AIService.createGatewayProvider(apiKey)

    const { embedding } = await embed({
      model: gateway.embeddingModel("openai/text-embedding-3-small"),
      value: text,
    })

    return embedding
  }

  /**
   * Retrieve relevant documents using vector similarity search
   */
  static async retrieveContext(
    db: DrizzleClient,
    query: string,
    apiKey: string,
    limit: number = 5,
  ): Promise<RetrievedContext[]> {
    try {
      // Generate query embedding using AI SDK
      const queryEmbedding = await AIService.generateEmbedding(query, apiKey)

      // Calculate similarity using Drizzle's cosineDistance
      const similarity = sql<number>`1 - (${cosineDistance(documentChunks.embedding, queryEmbedding)})`

      // Perform vector similarity search using Drizzle query builder
      const results = await db
        .select({
          content: documentChunks.content,
          source: documentChunks.source,
          page: documentChunks.page,
          similarity,
        })
        .from(documentChunks)
        .where(isNotNull(documentChunks.embedding))
        .orderBy(desc(similarity))
        .limit(limit)

      return results.map((row) => ({
        content: row.content,
        source: row.source,
        page: row.page ?? undefined,
        similarity: row.similarity,
      }))
    } catch (error) {
      // If embeddings table doesn't exist or is empty, return empty array
      console.error("RAG retrieval error:", error)
      return []
    }
  }

  /**
   * Format retrieved context for inclusion in prompt
   */
  static formatContext(contexts: RetrievedContext[]): string {
    if (contexts.length === 0) return ""

    const formatted = contexts
      .map(
        (ctx, i) =>
          `<doc id='${i + 1}' source='${ctx.source}'${ctx.page ? ` page='${ctx.page}'` : ""}>${ctx.content}</doc>`,
      )
      .join("\n")

    return `<context>\n${formatted}\n</context>`
  }

  /**
   * Load conversation history from database
   */
  static async loadConversationHistory(
    db: DrizzleClient,
    conversationId: string,
    userId: string,
    limit: number = 20,
  ): Promise<ConversationMessage[]> {
    const messages = await db
      .select({
        role: chatMessages.role,
        content: chatMessages.content,
      })
      .from(chatMessages)
      .innerJoin(
        chatConversations,
        eq(chatMessages.conversation_id, chatConversations.id),
      )
      .where(
        and(
          eq(chatMessages.conversation_id, conversationId),
          eq(chatConversations.user_id, userId),
        ),
      )
      .orderBy(desc(chatMessages.created_at))
      .limit(limit)

    // Reverse to get chronological order and map to correct types
    return messages.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
  }

  /**
   * Create or get conversation
   */
  static async getOrCreateConversation(
    db: DrizzleClient,
    userId: string,
    conversationId?: string,
    title?: string,
  ): Promise<string> {
    if (conversationId) {
      // Verify conversation exists AND belongs to this user
      const existing = await db
        .select({ id: chatConversations.id })
        .from(chatConversations)
        .where(
          and(
            eq(chatConversations.id, conversationId),
            eq(chatConversations.user_id, userId),
          ),
        )
        .limit(1)

      if (existing.length > 0) {
        return conversationId
      }
    }

    // Create new conversation
    const [conversation] = await db
      .insert(chatConversations)
      .values({
        user_id: userId,
        title: title?.substring(0, 50) || "Nueva conversación",
      })
      .returning()

    return conversation.id
  }

  /**
   * Save message to database
   */
  static async saveMessage(
    db: DrizzleClient,
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    metadata?: Record<string, unknown>,
  ) {
    const [message] = await db
      .insert(chatMessages)
      .values({
        conversation_id: conversationId,
        role,
        content,
        metadata: metadata || null,
      })
      .returning()

    return message
  }

  /**
   * Stream chat response with RAG
   */
  static async streamChat(params: StreamChatParams): Promise<{
    result: ReturnType<typeof streamText>
    conversationId: string
    contexts: RetrievedContext[]
    saveResponse: (fullResponse: string) => Promise<void>
  }> {
    const { db, userId, message, conversationId, apiKey } = params

    // Get or create conversation
    const convId = await AIService.getOrCreateConversation(
      db,
      userId,
      conversationId,
      message,
    )

    // Save user message
    await AIService.saveMessage(db, convId, "user", message)

    // Load conversation history
    const history = await AIService.loadConversationHistory(db, convId, userId)

    // Retrieve relevant context via RAG
    const contexts = await AIService.retrieveContext(db, message, apiKey)
    const contextBlock = AIService.formatContext(contexts)

    // Build messages array
    const systemPrompt = contextBlock
      ? `${KEBO_WISE_SYSTEM_PROMPT}\n\n${contextBlock}`
      : KEBO_WISE_SYSTEM_PROMPT

    const messages: ConversationMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // Last 10 messages for context window management
      { role: "user", content: message },
    ]

    // Stream response using AI SDK with AI Gateway
    const gateway = AIService.createGatewayProvider(apiKey)
    const result = streamText({
      model: gateway("anthropic/claude-sonnet-4.5"),
      messages,
      onError: ({ error }) => {
        console.error("AI stream error:", error)
      },
    })

    return {
      result,
      conversationId: convId,
      contexts,
      // Callback to save assistant message after streaming completes
      saveResponse: async (fullResponse: string) => {
        await AIService.saveMessage(db, convId, "assistant", fullResponse, {
          model: "anthropic/claude-sonnet-4.5",
          contexts: contexts.map((c) => ({
            source: c.source,
            similarity: c.similarity,
          })),
        })
      },
    }
  }

  /**
   * Non-streaming chat response
   */
  static async chat(
    params: StreamChatParams,
  ): Promise<{ content: string; conversationId: string }> {
    const { result, conversationId, saveResponse } =
      await AIService.streamChat(params)

    // Collect full response
    const fullText = await result.text

    // Save to database
    await saveResponse(fullText)

    return {
      content: fullText,
      conversationId,
    }
  }
}
