import { count, desc, eq, min, sql } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import { documentChunks } from "@/db/schema"
import { AIService } from "./ai.service"

interface SourceInfo {
  source: string
  chunk_count: number
  created_at: Date | null
}

export class EmbeddingService {
  /**
   * Split text into chunks with overlap
   */
  static splitText(
    text: string,
    chunkSize: number = 3000,
    overlap: number = 500,
  ): string[] {
    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      chunks.push(text.slice(start, end))
      start = end - overlap
      if (start + overlap >= text.length) break
    }

    return chunks
  }

  /**
   * Ingest a document: chunk, embed, and store
   */
  static async ingestDocument(
    db: DrizzleClient,
    apiKey: string,
    content: string,
    source: string,
    page?: number,
  ): Promise<number> {
    const textChunks = EmbeddingService.splitText(content)
    let insertedCount = 0

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]

      // Generate embedding using AI SDK
      const embedding = await AIService.generateEmbedding(chunk, apiKey)

      // Insert using Drizzle with native vector support
      await db.insert(documentChunks).values({
        content: chunk,
        embedding,
        source,
        page,
        chunk_index: i,
      })

      insertedCount++
    }

    return insertedCount
  }

  /**
   * Delete all chunks for a source
   */
  static async deleteBySource(
    db: DrizzleClient,
    source: string,
  ): Promise<void> {
    await db.delete(documentChunks).where(eq(documentChunks.source, source))
  }

  /**
   * Get all unique sources
   */
  static async listSources(db: DrizzleClient): Promise<SourceInfo[]> {
    const results = await db
      .select({
        source: documentChunks.source,
        chunk_count: count(),
        created_at: min(documentChunks.created_at),
      })
      .from(documentChunks)
      .groupBy(documentChunks.source)
      .orderBy(desc(min(documentChunks.created_at)))

    return results.map((row) => ({
      source: row.source,
      chunk_count: row.chunk_count,
      created_at: row.created_at,
    }))
  }
}
