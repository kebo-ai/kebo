import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { banks } from "./banks"

export const accountTypes = pgTable("account_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  type_name: varchar("type_name", { length: 100 }).notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  customized_name: varchar("customized_name", { length: 255 }),
  bank_id: uuid("bank_id")
    .notNull()
    .references(() => banks.id),
  icon_url: varchar("icon_url", { length: 500 }),
  account_type_id: uuid("account_type_id")
    .notNull()
    .references(() => accountTypes.id),
  balance: numeric("balance", { precision: 15, scale: 2 })
    .default("0")
    .notNull(),
  is_default: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
})

export const insertAccountSchema = createInsertSchema(accounts)
export const selectAccountSchema = createSelectSchema(accounts)
export const insertAccountTypeSchema = createInsertSchema(accountTypes)
export const selectAccountTypeSchema = createSelectSchema(accountTypes)

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type AccountType = typeof accountTypes.$inferSelect
export type NewAccountType = typeof accountTypes.$inferInsert
