import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const aiReports = pgTable("ai_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  message: jsonb("message").notNull(),
  report_message: text("report_message").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertAiReportSchema = createInsertSchema(aiReports)
export const selectAiReportSchema = createSelectSchema(aiReports)

export type AiReport = typeof aiReports.$inferSelect
export type NewAiReport = typeof aiReports.$inferInsert
