import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { iconTypeEnum } from "./enums"

export const icons = pgTable("icons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: iconTypeEnum("type").default("SVG").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertIconSchema = createInsertSchema(icons)
export const selectIconSchema = createSelectSchema(icons)

export type Icon = typeof icons.$inferSelect
export type NewIcon = typeof icons.$inferInsert
