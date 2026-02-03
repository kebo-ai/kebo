import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { accounts } from "./accounts"
import { accountUserRoleEnum } from "./enums"

export const accountsUsers = pgTable("accounts_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  account_id: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  user_id: uuid("user_id").notNull(),
  role: accountUserRoleEnum("role").default("Viewer").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  is_deleted: boolean("is_deleted").default(false).notNull(),
  deleted_at: timestamp("deleted_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const insertAccountsUsersSchema = createInsertSchema(accountsUsers)
export const selectAccountsUsersSchema = createSelectSchema(accountsUsers)

export type AccountsUsers = typeof accountsUsers.$inferSelect
export type NewAccountsUsers = typeof accountsUsers.$inferInsert
