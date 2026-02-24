"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type {
  Account,
  AccountWithBalance,
  CreateAccountInput,
  AccountType,
} from "../types"

interface DataResponse<T> {
  data: T
}

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.list(),
    queryFn: async () => {
      const response = await api.get<DataResponse<Account[]>>("/accounts")
      return response.data
    },
    ...queryConfig.accounts,
  })
}

export function useAccountsWithBalance() {
  return useQuery({
    queryKey: queryKeys.accounts.listWithBalance(),
    queryFn: async () => {
      const response = await api.get<DataResponse<AccountWithBalance[]>>(
        "/accounts/with-balance"
      )
      return response.data
    },
    ...queryConfig.accounts,
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => api.get<Account>(`/accounts/${id}`),
    enabled: !!id,
    ...queryConfig.accounts,
  })
}

export function useAccountTypes() {
  return useQuery({
    queryKey: queryKeys.accountTypes.all,
    queryFn: async () => {
      const response = await api.get<DataResponse<AccountType[]>>(
        "/reference/account-types"
      )
      return response.data
    },
    ...queryConfig.accountTypes,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccountInput) =>
      api.post<Account>("/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateAccountInput>
    }) => api.put<Account>(`/accounts/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.detail(variables.id),
      })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts.list() })

      const previousAccounts = queryClient.getQueryData<Account[]>(
        queryKeys.accounts.list()
      )

      if (previousAccounts) {
        queryClient.setQueryData<Account[]>(
          queryKeys.accounts.list(),
          previousAccounts.filter((a) => a.id !== id)
        )
      }

      return { previousAccounts }
    },
    onError: (_err, _id, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          queryKeys.accounts.list(),
          context.previousAccounts
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
    },
  })
}
