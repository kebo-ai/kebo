"use client"

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"
import { api } from "../client"
import { markMutationSettled } from "@/lib/realtime/invalidation-tracker"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type {
  Transaction,
  CreateTransactionInput,
  CreateTransferInput,
  Account,
  Category,
  UserBalance,
} from "../types"

interface TransactionFilters {
  account_id?: string
  category_id?: string
  transaction_type?: string
  month?: string // YYYY-MM format
  limit?: number
  offset?: number
}

interface TransactionsResponse {
  data: Transaction[]
  total: number
}

export function useTransactions(filters?: TransactionFilters) {
  const params = new URLSearchParams()

  if (filters?.account_id) params.set("account_id", filters.account_id)
  if (filters?.category_id) params.set("category_id", filters.category_id)
  if (filters?.transaction_type)
    params.set("transaction_type", filters.transaction_type)
  if (filters?.month) params.set("month", filters.month)
  if (filters?.limit) params.set("limit", String(filters.limit))
  if (filters?.offset) params.set("offset", String(filters.offset))

  const queryString = params.toString()
  const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`

  return useQuery({
    queryKey: queryKeys.transactions.list(filters as Record<string, unknown>),
    queryFn: () => api.get<TransactionsResponse>(endpoint),
    ...queryConfig.transactions,
    placeholderData: keepPreviousData,
  })
}

export function useRecentTransactions(limit: number = 5) {
  return useTransactions({ limit })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: () => api.get<Transaction>(`/transactions/${id}`),
    enabled: !!id,
    ...queryConfig.transactions,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      api.post<Transaction>("/transactions", data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.all })
      await queryClient.cancelQueries({ queryKey: queryKeys.balance.all })

      // Snapshot all transaction list caches
      const queryCache = queryClient.getQueryCache()
      const listQueries = queryCache.findAll({
        queryKey: queryKeys.transactions.lists(),
      })

      const snapshots: Array<{
        key: readonly unknown[]
        data: TransactionsResponse
      }> = []

      // Resolve joined fields from cached data
      const accounts = queryClient.getQueryData<Account[]>(
        queryKeys.accounts.list()
      )
      const categories = queryClient.getQueryData<Category[]>(
        queryKeys.categories.list()
      )

      const account = accounts?.find((a) => a.id === data.account_id)
      const category = data.category_id
        ? categories?.find((c) => c.id === data.category_id)
        : undefined

      const now = new Date().toISOString()
      const optimisticTransaction: Transaction = {
        id: crypto.randomUUID(),
        user_id: "",
        account_id: data.account_id,
        amount: data.amount,
        currency: data.currency,
        transaction_type: data.transaction_type,
        date: data.date,
        description: data.description,
        category_id: data.category_id,
        is_recurring: data.is_recurring ?? false,
        is_deleted: false,
        created_at: now,
        updated_at: now,
        account_name: account?.customized_name || account?.name,
        bank_name: account?.bank_name,
        category_name: category?.name,
        category_icon: category?.icon_url || category?.icon_emoji,
      }

      for (const query of listQueries) {
        const cached = query.state.data as TransactionsResponse | undefined
        if (cached) {
          snapshots.push({ key: query.queryKey, data: cached })
          queryClient.setQueryData<TransactionsResponse>(query.queryKey, {
            data: [optimisticTransaction, ...cached.data],
            total: cached.total + 1,
          })
        }
      }

      // Optimistic balance update
      const previousBalance = queryClient.getQueryData<UserBalance>(
        queryKeys.balance.all
      )
      if (previousBalance) {
        const delta =
          data.transaction_type === "Expense" ? -data.amount : data.amount
        queryClient.setQueryData<UserBalance>(queryKeys.balance.all, {
          ...previousBalance,
          total_balance: String(
            parseFloat(previousBalance.total_balance) + delta
          ),
          transactions_total: String(
            parseFloat(previousBalance.transactions_total) + delta
          ),
        })
      }

      return { snapshots, previousBalance }
    },
    onError: (_err, _data, context) => {
      if (context?.snapshots) {
        for (const { key, data } of context.snapshots) {
          queryClient.setQueryData(key, data)
        }
      }
      if (context?.previousBalance) {
        queryClient.setQueryData(queryKeys.balance.all, context.previousBalance)
      }
    },
    onSettled: () => {
      markMutationSettled("transactions")
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferInput) =>
      api.post<Transaction>("/transactions/transfer", data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.all })

      const queryCache = queryClient.getQueryCache()
      const listQueries = queryCache.findAll({
        queryKey: queryKeys.transactions.lists(),
      })

      const snapshots: Array<{
        key: readonly unknown[]
        data: TransactionsResponse
      }> = []

      const accounts = queryClient.getQueryData<Account[]>(
        queryKeys.accounts.list()
      )
      const fromAccount = accounts?.find((a) => a.id === data.from_account_id)

      const now = new Date().toISOString()
      const optimisticTransaction: Transaction = {
        id: crypto.randomUUID(),
        user_id: "",
        account_id: data.from_account_id,
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        currency: data.currency,
        transaction_type: "Transfer",
        date: data.date,
        description: data.description,
        is_recurring: false,
        is_deleted: false,
        created_at: now,
        updated_at: now,
        account_name: fromAccount?.customized_name || fromAccount?.name,
        bank_name: fromAccount?.bank_name,
      }

      for (const query of listQueries) {
        const cached = query.state.data as TransactionsResponse | undefined
        if (cached) {
          snapshots.push({ key: query.queryKey, data: cached })
          queryClient.setQueryData<TransactionsResponse>(query.queryKey, {
            data: [optimisticTransaction, ...cached.data],
            total: cached.total + 1,
          })
        }
      }

      return { snapshots }
    },
    onError: (_err, _data, context) => {
      if (context?.snapshots) {
        for (const { key, data } of context.snapshots) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      markMutationSettled("transactions")
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateTransactionInput>
    }) => api.put<Transaction>(`/transactions/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.transactions.detail(id),
      })

      const previousDetail = queryClient.getQueryData<Transaction>(
        queryKeys.transactions.detail(id)
      )

      if (previousDetail) {
        queryClient.setQueryData<Transaction>(
          queryKeys.transactions.detail(id),
          { ...previousDetail, ...data }
        )
      }

      return { previousDetail }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.transactions.detail(id),
          context.previousDetail
        )
      }
    },
    onSettled: (_data, _err, { id }) => {
      markMutationSettled("transactions")
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.all })

      const queryCache = queryClient.getQueryCache()
      const listQueries = queryCache.findAll({
        queryKey: queryKeys.transactions.lists(),
      })

      const snapshots: Array<{
        key: readonly unknown[]
        data: TransactionsResponse
      }> = []

      for (const query of listQueries) {
        const data = query.state.data as TransactionsResponse | undefined
        if (data) {
          snapshots.push({ key: query.queryKey, data })
          queryClient.setQueryData<TransactionsResponse>(query.queryKey, {
            data: data.data.filter((t) => t.id !== id),
            total: data.total - 1,
          })
        }
      }

      return { snapshots }
    },
    onError: (_err, _id, context) => {
      if (context?.snapshots) {
        for (const { key, data } of context.snapshots) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      markMutationSettled("transactions")
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })
    },
  })
}
