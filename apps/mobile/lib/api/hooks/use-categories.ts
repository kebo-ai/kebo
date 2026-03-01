import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Category, TransactionType } from "../types"

const client = getApiClient()

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const res = await unwrap<{ data: Category[] }>(
        await client.categories.$get({ query: {} })
      )
      return res.data
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
  const { data: categories, ...rest } = useCategories()
  return {
    ...rest,
    data: categories?.find((c) => c.id === id),
  }
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      type: TransactionType
      icon_url?: string
      icon_emoji?: string
      color_id?: number
    }) => unwrap<Category>(await client.categories.$post({ json: data })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        name: string
        type: TransactionType
        icon_url?: string
        icon_emoji?: string
        color_id?: number
      }>
    }) =>
      unwrap<Category>(
        await client.categories[":id"].$put({ param: { id }, json: data })
      ),
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
    mutationFn: async (id: string) =>
      unwrap<{ success: boolean }>(
        await client.categories[":id"].$delete({ param: { id } })
      ),
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
