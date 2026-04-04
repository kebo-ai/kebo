import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type {
  Budget,
  BudgetWithDetails,
  CreateBudgetInput,
} from "../types"

const client = getApiClient()

export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets.list(),
    queryFn: async () => {
      const res = await unwrap<{ data: Budget[] }>(
        await client.budgets.$get()
      )
      return res.data
    },
    ...queryConfig.budgets,
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: async () =>
      unwrap<BudgetWithDetails>(
        await client.budgets[":id"].$get({ param: { id } })
      ),
    enabled: !!id,
    ...queryConfig.budgets,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBudgetInput) =>
      unwrap<Budget>(await client.budgets.$put({ json: data as never })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateBudgetInput>
    }) =>
      unwrap<Budget>(
        await client.budgets.$put({ json: { ...data, id } as never })
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(variables.id),
      })
    },
  })
}

export function useUpdateBudgetLines() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      currentBudget,
      lines,
    }: {
      budgetId: string
      currentBudget: BudgetWithDetails
      lines: Array<{ category_id: string; amount: number }>
    }) =>
      unwrap<Budget>(
        await client.budgets.$put({
          json: {
            id: budgetId,
            custom_name: currentBudget.custom_name,
            start_date: currentBudget.start_date,
            end_date: currentBudget.end_date,
            budget_lines: lines,
          } as never,
        })
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(variables.budgetId),
      })
    },
  })
}

export function useRemoveBudgetLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      categoryId,
      currentBudget,
    }: {
      budgetId: string
      categoryId: string
      currentBudget: BudgetWithDetails
    }) => {
      const remainingLines = currentBudget.budget_lines
        .filter((line) => line.category_id !== categoryId)
        .map((line) => ({
          category_id: line.category_id,
          amount: Number(line.amount),
        }))

      return unwrap<Budget>(
        await client.budgets.$put({
          json: {
            id: budgetId,
            custom_name: currentBudget.custom_name,
            start_date: currentBudget.start_date,
            end_date: currentBudget.end_date,
            budget_lines: remainingLines,
          } as never,
        })
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(variables.budgetId),
      })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<{ success: boolean }>(
        await client.budgets[":id"].$delete({ param: { id } })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}
