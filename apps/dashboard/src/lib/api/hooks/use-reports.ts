"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "../client"
import type {
  IncomeExpenseReport,
  ExpenseReportByCategory,
  ReportGranularity,
} from "../types"

interface IncomeExpenseParams {
  periodDate?: string // YYYY-MM-DD format
  granularity?: ReportGranularity
}

interface ExpenseByCategoryParams {
  periodDate?: string // YYYY-MM-DD format
}

/**
 * Get comprehensive income vs expense report with time series
 */
export function useIncomeExpenseReport(params?: IncomeExpenseParams) {
  const searchParams = new URLSearchParams()

  if (params?.periodDate) searchParams.set("periodDate", params.periodDate)
  if (params?.granularity) searchParams.set("granularity", params.granularity)

  const queryString = searchParams.toString()
  const endpoint = `/reports/income-expense${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: ["reports", "income-expense", params],
    queryFn: () => api.get<IncomeExpenseReport>(endpoint),
  })
}

/**
 * Get expense breakdown by category for a specific month
 */
export function useExpenseByCategory(params?: ExpenseByCategoryParams) {
  const searchParams = new URLSearchParams()

  if (params?.periodDate) searchParams.set("periodDate", params.periodDate)

  const queryString = searchParams.toString()
  const endpoint = `/reports/expense-by-category${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: ["reports", "expense-by-category", params],
    queryFn: () => api.get<ExpenseReportByCategory>(endpoint),
  })
}
