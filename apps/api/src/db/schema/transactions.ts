import {
  boolean,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { accounts } from "./accounts"
import { categories } from "./categories"
import { recurrenceCadenceEnum, transactionTypeEnum } from "./enums"

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  account_id: uuid("account_id").references(() => accounts.id),
  from_account_id: uuid("from_account_id"),
  to_account_id: uuid("to_account_id"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  transaction_type: transactionTypeEnum("transaction_type").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: varchar("description", { length: 500 }),
  icon_url: varchar("icon_url", { length: 500 }),
  category_id: uuid("category_id").references(() => categories.id),
  is_recurring: boolean("is_recurring").default(false),
  recurrence_cadence: recurrenceCadenceEnum("recurrence_cadence"),
  recurrence_end_date: timestamp("recurrence_end_date"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertTransactionSchema = createInsertSchema(transactions, {
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  date: z.string().datetime(),
})

export const selectTransactionSchema = createSelectSchema(transactions)

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
