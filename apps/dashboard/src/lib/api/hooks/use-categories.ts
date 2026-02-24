"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Category, CreateCategoryInput, TransactionType } from "../types"

interface DataResponse<T> {
  data: T
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const response = await api.get<DataResponse<Category[]>>("/categories")
      return response.data
    },
    ...queryConfig.categories,
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
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => api.get<Category>(`/categories/${id}`),
    enabled: !!id,
    ...queryConfig.categories,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      api.post<Category>("/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateCategoryInput>
    }) => api.put<Category>(`/categories/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.list(),
      })

      const previousCategories = queryClient.getQueryData<Category[]>(
        queryKeys.categories.list()
      )

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          queryKeys.categories.list(),
          previousCategories.filter((c) => c.id !== id)
        )
      }

      return { previousCategories }
    },
    onError: (_err, _id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(
          queryKeys.categories.list(),
          context.previousCategories
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })
}
