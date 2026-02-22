import { supabase } from "@/config/supabase";
import logger from "@/utils/logger";

interface ExpenseReportResponse {
  period: string;
  period_label: string;
  prev_period: string;
  next_period: string;
  total: number;
  transaction_count?: number;
  data_categories: Array<{
    transaction_count: any;
    id: string;
    name: string;
    icon: string;
    amount: number;
    percentage: number;
    bar_color: string;
  }>;
}

export interface IncomeExpenseReportItem {
  period: string;
  period_label: string;
  income: number;
  expense: number;
  net: number;
  sort_order: number;
  transaction_count?: number;
}

export interface IncomeExpenseReportResponse {
  granularity: string;
  period: string;
  period_label: string;
  prev_period?: string;
  next_period?: string;
  period_start?: string;
  period_end?: string;
  transaction_count?: number;
  summary: {
    total_income: number;
    total_expenses: number;
    total_balance: number;
    net_savings_rate: number;
  };
  time_series: IncomeExpenseReportItem[];
  categories?: {
    income?: any[];
    expenses?: any[];
  };
}

export class ChartService {
  static async getExpenseReportByCategory(
    periodDate?: Date
  ): Promise<ExpenseReportResponse> {
    try {
      const { data, error } = await supabase.rpc(
        "get_expense_report_by_category",
        {
          p_period_date: periodDate?.toISOString() || new Date().toISOString(),
        }
      );

      if (error) {
        logger.error("Error fetching expense report:", error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error("Error in getExpenseReportByCategory:", error);
      throw error;
    }
  }

  static async getIncomeExpenseReport(
    p_period_date: string | Date,
    p_granularity: string
  ): Promise<IncomeExpenseReportResponse | null> {
    try {
      const dateString =
        typeof p_period_date === "string"
          ? p_period_date
          : p_period_date.toISOString().slice(0, 10);
      const { data, error } = await supabase.rpc("get_income_expense_report", {
        p_period_date: dateString,
        p_granularity: p_granularity,
      });
      if (error) {
        logger.error("Error fetching income/expense report:", error);
        throw error;
      }
      return data;
    } catch (error) {
      logger.error("Error in getIncomeExpenseReport:", error);
      throw error;
    }
  }
}
