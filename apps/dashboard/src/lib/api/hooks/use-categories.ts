"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import type { Category, CreateCategoryInput, TransactionType } from "../types"

interface DataResponse<T> {
  data: T
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<DataResponse<Category[]>>("/categories")
      return response.data
    },
  })
}

export function useCategoriesByType(type: TransactionType) {
  const { data: categories, ...rest } = useCategories()

  const filteredCategories = categories?.filter(
    (cat) => cat.type === type && cat.is_visible && !cat.is_deleted
  )

  return {
    ...rest,
    data: filteredCategories,
  }
}

export function useExpenseCategories() {
  return useCategoriesByType("Expense")
}

export function useIncomeCategories() {
  return useCategoriesByType("Income")
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => api.get<Category>(`/categories/${id}`),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      api.post<Category>("/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryInput> }) =>
      api.put<Category>(`/categories/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })
}
