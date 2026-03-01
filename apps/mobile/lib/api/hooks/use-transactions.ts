import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { markMutationSettled } from "@/lib/realtime/invalidation-tracker"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import logger from "@/utils/logger"

/** Generate a temporary UUID for optimistic updates (Hermes lacks crypto.randomUUID) */
function tempId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}
import type {
  Transaction,
  CreateTransactionInput,
  CreateTransferInput,
  Account,
  Category,
  UserBalance,
} from "../types"

const client = getApiClient()

interface TransactionFilters {
  account_ids?: string[] // multiple accounts
  category_ids?: string[] // multiple categories
  transaction_type?: string
  start_date?: string
  end_date?: string
  limit?: number
  page?: number
}

interface TransactionsApiResponse {
  data: Transaction[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface TransactionsResponse {
  data: Transaction[]
  total: number
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await unwrap<TransactionsApiResponse>(
        await client.transactions.$get({
          query: {
            page: filters?.page,
            limit: filters?.limit,
            transactionType: filters?.transaction_type as
              | "Income"
              | "Expense"
              | "Transfer"
              | undefined,
            accountIds: filters?.account_ids?.join(","),
            categoryIds: filters?.category_ids?.join(","),
            startDate: filters?.start_date,
            endDate: filters?.end_date,
          },
        })
      )
      return { data: res.data, total: res.pagination.total } as TransactionsResponse
    },
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
    queryFn: async () =>
      unwrap<Transaction>(
        await client.transactions[":id"].$get({ param: { id } })
      ),
    enabled: !!id,
    ...queryConfig.transactions,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      try {
        const result = await unwrap<Transaction>(
          await client.transactions.$post({ json: data as never })
        )
        return result
      } catch (err: any) {
        logger.error("[useCreateTransaction] API error:", err, "data:", JSON.stringify(err?.data))
        throw err
      }
    },
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
        id: tempId(),
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
        bank_url: account?.bank_url,
        bank_id: account?.bank_id,
        category_name: category?.name,
        category_icon_url: category?.icon_url,
        category_icon_emoji: category?.icon_emoji,
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
    onError: (err, _data, context) => {
      logger.error("[useCreateTransaction] onError - rolling back optimistic update:", err)
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
    mutationFn: async (data: CreateTransferInput) =>
      unwrap<Transaction>(
        await client.transactions.transfer.$post({ json: data as never })
      ),
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
        id: tempId(),
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
        bank_url: fromAccount?.bank_url,
        bank_id: fromAccount?.bank_id,
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateTransactionInput>
    }) =>
      unwrap<Transaction>(
        await client.transactions[":id"].$put({
          param: { id },
          json: data as never,
        })
      ),
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
    mutationFn: async (id: string) =>
      unwrap<{ success: boolean }>(
        await client.transactions[":id"].$delete({ param: { id } })
      ),
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
