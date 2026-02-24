"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { api } from "../client"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
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

export function useIncomeExpenseReport(params?: IncomeExpenseParams) {
  const searchParams = new URLSearchParams()

  if (params?.periodDate) searchParams.set("periodDate", params.periodDate)
  if (params?.granularity) searchParams.set("granularity", params.granularity)

  const queryString = searchParams.toString()
  const endpoint = `/reports/income-expense${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: queryKeys.reports.incomeExpense(
      params as Record<string, unknown>
    ),
    queryFn: () => api.get<IncomeExpenseReport>(endpoint),
    ...queryConfig.reports,
    placeholderData: keepPreviousData,
  })
}

export function useExpenseByCategory(params?: ExpenseByCategoryParams) {
  const searchParams = new URLSearchParams()

  if (params?.periodDate) searchParams.set("periodDate", params.periodDate)

  const queryString = searchParams.toString()
  const endpoint = `/reports/expense-by-category${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: queryKeys.reports.expenseByCategory(
      params as Record<string, unknown>
    ),
    queryFn: () => api.get<ExpenseReportByCategory>(endpoint),
    ...queryConfig.reports,
    placeholderData: keepPreviousData,
  })
}
