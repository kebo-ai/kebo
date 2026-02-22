import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { colors } from "./colors"
import { categoryTypeEnum } from "./enums"
import { globalCategories } from "./global-categories"

// User-specific categories (linked to global templates)
export const categories = pgTable("categories_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  category_id: uuid("category_id").references(() => globalCategories.id),
  type: categoryTypeEnum("type").notNull(),
  name: text("name"),
  icon_url: varchar("icon_url", { length: 500 }),
  icon_emoji: varchar("icon_emoji"),
  color_id: integer("color_id").references(() => colors.id),
  is_visible: boolean("is_visible").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertCategorySchema = createInsertSchema(categories)
export const selectCategorySchema = createSelectSchema(categories)

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
