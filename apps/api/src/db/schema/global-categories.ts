import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { colors } from "./colors"
import { categoryTypeEnum } from "./enums"

// Global category templates (not user-specific)
export const globalCategories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: categoryTypeEnum("type").notNull(),
  parent_id: uuid("parent_id"),
  name: text("name"),
  icon_url: text("icon_url"),
  color_id: integer("color_id").references(() => colors.id),
  is_visible: boolean("is_visible").default(true),
  order_priority: integer("order_priority").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertGlobalCategorySchema = createInsertSchema(globalCategories)
export const selectGlobalCategorySchema = createSelectSchema(globalCategories)

export type GlobalCategory = typeof globalCategories.$inferSelect
export type NewGlobalCategory = typeof globalCategories.$inferInsert
