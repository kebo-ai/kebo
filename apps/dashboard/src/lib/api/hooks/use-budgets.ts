"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Budget, BudgetWithDetails, CreateBudgetInput } from "../types"

interface DataResponse<T> {
  data: T
}

export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets.list(),
    queryFn: async () => {
      const response = await api.get<DataResponse<Budget[]>>("/budgets")
      return response.data
    },
    ...queryConfig.budgets,
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: () => api.get<BudgetWithDetails>(`/budgets/${id}`),
    enabled: !!id,
    ...queryConfig.budgets,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetInput) =>
      api.put<Budget>("/budgets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateBudgetInput>
    }) => api.put<Budget>("/budgets", { ...data, id }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(variables.id),
      })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}
