export enum RecurrenceCadenceEnum {
  NEVER = "Never",
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  YEARLY = "Yearly",
}

export enum TransactionType {
  EXPENSE = "Expense",
  INCOME = "Income",
  TRANSFER = "Transfer",
}

export enum RecurrenceType {
  NEVER = "Never",
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  YEARLY = "Yearly",
}

export const recurrenceDisplayMap: Record<RecurrenceType, string> = {
  [RecurrenceType.NEVER]: "transactionScreen:never",
  [RecurrenceType.DAILY]: "transactionScreen:daily",
  [RecurrenceType.WEEKLY]: "transactionScreen:weekly",
  [RecurrenceType.MONTHLY]: "transactionScreen:monthly",
  [RecurrenceType.YEARLY]: "transactionScreen:yearly",
};

export const recurrenceDisplayValueMap: Record<string, RecurrenceType> = {
  ["transactionScreen:never"]: RecurrenceType.NEVER,
  ["transactionScreen:daily"]: RecurrenceType.DAILY,
  ["transactionScreen:weekly"]: RecurrenceType.WEEKLY,
  ["transactionScreen:monthly"]: RecurrenceType.MONTHLY,
  ["transactionScreen:yearly"]: RecurrenceType.YEARLY,
};

export interface TransactionFormValues {
  account: string;
  from_account?: string;
  to_account?: string;
  category?: string;
  date: string;
  displayDate: string;
  recurrence: RecurrenceType;
  recurrence_cadence: RecurrenceCadenceEnum;
  recurrence_end_date: string;
  displayEndDate: string;
  note: string;
}

export interface Budget {
  id: string;
  user_id: string;
  is_active: boolean;
  is_recurrent: boolean;
  custom_name: string;
  budget_amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface BudgetLine {
  id: string;
  category_id: string;
  category_name: string;
  icon_url: string;
  icon_emoji: string | null;
  color_id: string | null;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
}

export interface TotalMetrics {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  overall_progress_percentage: number;
}

export interface BudgetResponse {
  budget: Budget;
  budget_lines: BudgetLine[];
  total_metrics: TotalMetrics;
}

