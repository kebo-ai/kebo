"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import type { Budget, BudgetWithDetails, CreateBudgetInput } from "../types"

interface DataResponse<T> {
  data: T
}

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await api.get<DataResponse<Budget[]>>("/budgets")
      return response.data
    },
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ["budget", id],
    queryFn: () => api.get<BudgetWithDetails>(`/budgets/${id}`),
    enabled: !!id,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetInput) =>
      api.put<Budget>("/budgets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBudgetInput> }) =>
      api.put<Budget>("/budgets", { ...data, id }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budget", variables.id] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
    },
  })
}
