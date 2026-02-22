import {
  boolean,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const colors = pgTable("colors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  hex_value: varchar("hex_value", { length: 7 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertColorSchema = createInsertSchema(colors)
export const selectColorSchema = createSelectSchema(colors)

export type Color = typeof colors.$inferSelect
export type NewColor = typeof colors.$inferInsert
