import { pgEnum } from "drizzle-orm/pg-core"

// Account sharing roles
export const accountUserRoleEnum = pgEnum("account_user_role_enum", [
  "Owner",
  "Editor",
  "Viewer",
])

// Budget period options
export const budgetPeriodEnum = pgEnum("budget_period_enum", [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
  "Custom",
])

// Budget collaboration roles
export const budgetRoleEnum = pgEnum("budget_role_enum", [
  "Owner",
  "Collaborator",
  "Viewer",
])

// Category types
export const categoryTypeEnum = pgEnum("category_type_enum", [
  "Income",
  "Expense",
  "Transfer",
  "Investment",
  "Other",
])

// Icon storage types
export const iconTypeEnum = pgEnum("icon_type_enum", [
  "SVG",
  "PNG",
  "JPEG",
  "ICON_FONT",
  "URL",
])

// Transaction recurrence options
export const recurrenceCadenceEnum = pgEnum("recurrence_cadence_enum", [
  "Never",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Custom",
])

// Transaction types
export const transactionTypeEnum = pgEnum("transaction_type_enum", [
  "Income",
  "Expense",
  "Transfer",
  "Investment",
  "Other",
])
