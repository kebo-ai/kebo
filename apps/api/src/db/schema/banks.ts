import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const banks = pgTable("banks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  country_code: varchar("country_code"),
  open_finance_integrated: boolean("open_finance_integrated").default(false),
  bank_url: varchar("bank_url", { length: 255 }),
  description: varchar("description", { length: 255 }),
  country_flag: varchar("country_flag", { length: 10 }),
  account_type: jsonb("account_type").default({}),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertBankSchema = createInsertSchema(banks)
export const selectBankSchema = createSelectSchema(banks)

export type Bank = typeof banks.$inferSelect
export type NewBank = typeof banks.$inferInsert
