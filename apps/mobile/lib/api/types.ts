// Transaction types
export type TransactionType =
  | "Expense"
  | "Income"
  | "Transfer"
  | "Investment"
  | "Other"

export type RecurrenceCadence =
  | "Never"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Yearly"
  | "Custom"

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  from_account_id?: string
  to_account_id?: string
  amount: number
  currency: string
  transaction_type: TransactionType
  date: string
  description?: string
  icon_url?: string
  category_id?: string
  is_recurring: boolean
  recurrence_cadence?: RecurrenceCadence
  recurrence_end_date?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  is_deleted: boolean
  // Joined fields
  category_name?: string
  category_icon_url?: string
  category_icon_emoji?: string
  account_name?: string
  bank_name?: string
  bank_url?: string
  bank_id?: string
}

export interface CreateTransactionInput {
  account_id: string
  amount: number
  currency: string
  transaction_type: TransactionType
  date: string
  description?: string
  category_id?: string
  is_recurring?: boolean
  recurrence_cadence?: RecurrenceCadence
  recurrence_end_date?: string
}

export interface CreateTransferInput {
  from_account_id: string
  to_account_id: string
  amount: number
  currency: string
  date: string
  description?: string
}

// Category types
export interface Category {
  id: string
  user_id: string
  category_id?: string // Reference to global category
  type: TransactionType
  name: string
  icon_url?: string
  icon_emoji?: string
  color_id?: string
  is_visible: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateCategoryInput {
  type: TransactionType
  name: string
  icon_url?: string
  icon_emoji?: string
  color_id?: number
}

// Account types
export interface Account {
  id: string
  user_id: string
  name: string
  customized_name?: string
  bank_id?: string
  icon_url?: string
  account_type_id: string
  balance: string // Calculated balance as string from SQL
  base_balance?: string // Initial balance before transactions
  is_default: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  // Joined fields
  bank_name?: string
  bank_url?: string
  account_type?: string
}

export interface AccountWithBalance extends Account {
  sum__total_balance: number
}

export interface CreateAccountInput {
  name: string
  customized_name?: string
  bank_id?: string
  account_type_id: string
  balance: number
}

// Bank types
export interface Bank {
  id: string
  name: string
  country_code?: string
  bank_url?: string
  description?: string
  country_flag?: string
  open_finance_integrated: boolean
}

export interface CreateBankInput {
  name: string
  country_code?: string
  bank_url?: string
  description?: string
  country_flag?: string
  open_finance_integrated?: boolean
}

// Account Type
export interface AccountType {
  id: string
  type_name: string
  description?: string
}

// Budget types
export interface BudgetLine {
  id: string
  category_id: string
  category_name?: string
  icon_url?: string
  icon_emoji?: string
  color_id?: string
  amount: string
  spent_amount?: string
  remaining_amount?: string
  progress_percentage?: string
}

export interface BudgetTotalMetrics {
  total_budget: string
  total_spent: string
  total_remaining: string
  overall_progress_percentage: string
}

export interface Budget {
  id: string
  user_id: string
  is_active: boolean
  is_recurrent: boolean
  custom_name?: string
  budget_amount: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  // Calculated fields from list endpoint
  total_spent?: string
  total_remaining?: string
  progress_percentage?: string
}

export interface BudgetWithDetails extends Budget {
  budget_lines: BudgetLine[]
  total_metrics: BudgetTotalMetrics
}

export interface CreateBudgetInput {
  custom_name?: string
  budget_amount: number
  start_date: string
  end_date: string
  is_recurrent?: boolean
  budget_lines?: Array<{
    category_id: string
    amount: number
  }>
}

// User/Profile types
export interface Profile {
  id: string
  user_id: string
  email: string
  full_name?: string
  avatar_url?: string
  country?: string
  currency?: string
  language?: string
  timezone?: string
  phone?: string
  push_notifications: boolean
  email_notifications: boolean
}

export interface UpdateProfileInput {
  full_name?: string
  avatar_url?: string
  country?: string
  currency?: string
  language?: string
  timezone?: string
  phone?: string
  push_notifications?: boolean
  email_notifications?: boolean
}

// Report types
export type ReportGranularity = "year" | "month" | "week"

export interface TimeSeriesItem {
  period: string
  period_label: string
  income: number
  expense: number
  net: number
  sort_order: number
}

export interface CategoryBreakdownItem {
  id: string
  name: string
  icon: string
  amount: number
  transaction_count: number
  percentage: number
  bar_color: string
}

export interface IncomeExpenseReport {
  granularity: ReportGranularity
  period: string
  period_label: string
  prev_period: string
  next_period: string
  period_start: string
  period_end: string
  summary: {
    total_income: number
    total_expenses: number
    total_balance: number
    net_savings_rate: number
  }
  time_series: TimeSeriesItem[]
  categories: {
    income: CategoryBreakdownItem[]
    expenses: CategoryBreakdownItem[]
  }
}

export interface ExpenseReportByCategory {
  period: string
  period_label: string
  prev_period: string
  next_period: string
  total: number
  data_categories: CategoryBreakdownItem[]
}

// Legacy types for backwards compatibility
export interface IncomeExpenseReportItem {
  month: string
  income: number
  expense: number
}

export interface CategoryReportItem {
  category_id: string
  category_name: string
  icon_url?: string
  total_amount: number
  percentage: number
}

// Balance types
export interface UserBalance {
  total_balance: string
  transactions_total: string
  accounts_total: string
}

// Chat types
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface SendChatMessageInput {
  message: string
  conversation_id?: string
}

// Reference types
export interface Icon {
  id: string
  name: string
  url: string
  category?: string
}

export interface Color {
  id: string
  name: string
  hex: string
}
