import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { accounts } from "./accounts"
import { banks } from "./banks"

export const banksUsers = pgTable("banks_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  bank_id: uuid("bank_id")
    .notNull()
    .references(() => banks.id),
  user_id: uuid("user_id").notNull(),
  account_id: uuid("account_id").references(() => accounts.id),
  integration_status: varchar("integration_status", { length: 50 })
    .default("Pending")
    .notNull(),
  api_token: varchar("api_token", { length: 500 }),
  is_active: boolean("is_active").default(true),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const insertBanksUsersSchema = createInsertSchema(banksUsers)
export const selectBanksUsersSchema = createSelectSchema(banksUsers)

export type BanksUsers = typeof banksUsers.$inferSelect
export type NewBanksUsers = typeof banksUsers.$inferInsert
