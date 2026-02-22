import {
  boolean,
  numeric,
  pgView,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { recurrenceCadenceEnum, transactionTypeEnum } from "./enums"

// Views are read-only and defined for type safety
// These mirror existing Supabase views

export const transactionsWithDetails = pgView("transactions_with_details", {
  id: uuid("id"),
  amount: numeric("amount"),
  currency: varchar("currency", { length: 10 }),
  date: timestamp("date"),
  description: varchar("description", { length: 500 }),
  transaction_type: transactionTypeEnum("transaction_type"),
  is_recurring: boolean("is_recurring"),
  recurrence_cadence: recurrenceCadenceEnum("recurrence_cadence"),
  recurrence_end_date: timestamp("recurrence_end_date"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
  is_deleted: boolean("is_deleted"),
  category_id: uuid("category_id"),
  category_name: text("category_name"),
  category_icon_url: varchar("category_icon_url", { length: 500 }),
  category_icon_emoji: varchar("category_icon_emoji"),
  category_color_id: numeric("category_color_id"),
  account_id: uuid("account_id"),
  account_name: varchar("account_name", { length: 255 }),
  account_balance: numeric("account_balance"),
  bank_id: uuid("bank_id"),
  bank_name: varchar("bank_name", { length: 255 }),
  bank_url: varchar("bank_url", { length: 255 }),
}).existing()

export const userBalance = pgView("user_balance", {
  total_balance: numeric("total_balance"),
  transactions_total: numeric("transactions_total"),
  accounts_total: numeric("accounts_total"),
}).existing()

export const userBalanceByAccount = pgView("user_balance_by_account_vw", {
  account_id: uuid("account_id"),
  account_name: varchar("account_name", { length: 255 }),
  customized_name: varchar("customized_name", { length: 255 }),
  account_type: text("account_type"),
  icon_url: varchar("icon_url", { length: 500 }),
  base_balance: numeric("base_balance"),
  transactions_total: numeric("sum__transactions_total"),
  total_balance: numeric("sum__total_balance"),
}).existing()
