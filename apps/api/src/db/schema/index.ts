import { relations } from "drizzle-orm"

// Export all schemas
export * from "./accounts"
export * from "./accounts-users"
export * from "./ai-reports"
export * from "./banks"
export * from "./banks-users"
export * from "./banners"
export * from "./budgets"
export * from "./categories"
export * from "./chat"
export * from "./colors"
// Export all enums
export * from "./enums"
export * from "./global-categories"
export * from "./icons"
export * from "./profiles"
export * from "./transactions"
export * from "./views"

// Import for relations
import { accounts, accountTypes } from "./accounts"
import { accountsUsers } from "./accounts-users"
import { aiReports } from "./ai-reports"
import { banks } from "./banks"
import { banksUsers } from "./banks-users"
import { budgetLines, budgets } from "./budgets"
import { categories } from "./categories"
import { chatConversations, chatMessages } from "./chat"
import { colors } from "./colors"
import { globalCategories } from "./global-categories"
import { profiles } from "./profiles"
import { transactions } from "./transactions"

// Define relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  transactions: many(transactions),
  accounts: many(accounts),
  categories: many(categories),
  budgets: many(budgets),
  aiReports: many(aiReports),
  chatConversations: many(chatConversations),
}))

export const accountTypesRelations = relations(accountTypes, ({ many }) => ({
  accounts: many(accounts),
}))

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  accountType: one(accountTypes, {
    fields: [accounts.account_type_id],
    references: [accountTypes.id],
  }),
  bank: one(banks, {
    fields: [accounts.bank_id],
    references: [banks.id],
  }),
  transactions: many(transactions),
  accountsUsers: many(accountsUsers),
  banksUsers: many(banksUsers),
}))

export const accountsUsersRelations = relations(accountsUsers, ({ one }) => ({
  account: one(accounts, {
    fields: [accountsUsers.account_id],
    references: [accounts.id],
  }),
}))

export const banksRelations = relations(banks, ({ many }) => ({
  accounts: many(accounts),
  banksUsers: many(banksUsers),
}))

export const banksUsersRelations = relations(banksUsers, ({ one }) => ({
  bank: one(banks, {
    fields: [banksUsers.bank_id],
    references: [banks.id],
  }),
  account: one(accounts, {
    fields: [banksUsers.account_id],
    references: [accounts.id],
  }),
}))

export const colorsRelations = relations(colors, ({ many }) => ({
  globalCategories: many(globalCategories),
  categories: many(categories),
}))

export const globalCategoriesRelations = relations(
  globalCategories,
  ({ one, many }) => ({
    color: one(colors, {
      fields: [globalCategories.color_id],
      references: [colors.id],
    }),
    userCategories: many(categories),
  }),
)

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  globalCategory: one(globalCategories, {
    fields: [categories.category_id],
    references: [globalCategories.id],
  }),
  color: one(colors, {
    fields: [categories.color_id],
    references: [colors.id],
  }),
  transactions: many(transactions),
  budgetLines: many(budgetLines),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.category_id],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [transactions.account_id],
    references: [accounts.id],
  }),
}))

export const budgetsRelations = relations(budgets, ({ many }) => ({
  lines: many(budgetLines),
}))

export const budgetLinesRelations = relations(budgetLines, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetLines.budget_id],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [budgetLines.category_id],
    references: [categories.id],
  }),
}))

export const aiReportsRelations = relations(aiReports, ({ one }) => ({
  // Note: user relation would require FK to auth.users which isn't directly modeled
}))

export const chatConversationsRelations = relations(
  chatConversations,
  ({ many }) => ({
    messages: many(chatMessages),
  }),
)

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversation_id],
    references: [chatConversations.id],
  }),
}))
