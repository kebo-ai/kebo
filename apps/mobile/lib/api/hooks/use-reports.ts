import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type {
  IncomeExpenseReport,
  ExpenseReportByCategory,
  ReportGranularity,
} from "../types"

const client = getApiClient()

interface IncomeExpenseParams {
  periodDate?: string // YYYY-MM-DD format
  granularity?: ReportGranularity
}

interface ExpenseByCategoryParams {
  periodDate?: string // YYYY-MM-DD format
}

export function useIncomeExpenseReport(params?: IncomeExpenseParams) {
  return useQuery({
    queryKey: queryKeys.reports.incomeExpense(
      params as Record<string, unknown>
    ),
    queryFn: async () =>
      unwrap<IncomeExpenseReport>(
        await client.reports["income-expense"].$get({
          query: {
            periodDate: params?.periodDate,
            granularity: params?.granularity,
          },
        })
      ),
    ...queryConfig.reports,
    placeholderData: keepPreviousData,
  })
}

export function useExpenseByCategory(params?: ExpenseByCategoryParams) {
  return useQuery({
    queryKey: queryKeys.reports.expenseByCategory(
      params as Record<string, unknown>
    ),
    queryFn: async () =>
      unwrap<ExpenseReportByCategory>(
        await client.reports["expense-by-category"].$get({
          query: {
            periodDate: params?.periodDate,
          },
        })
      ),
    ...queryConfig.reports,
    placeholderData: keepPreviousData,
  })
}
