"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Account, AccountWithBalance, AccountType } from "../types"

const client = getApiClient()

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.list(),
    queryFn: async () => {
      const res = await unwrap<{ data: Account[] }>(
        await client.accounts.$get()
      )
      return res.data
    },
    ...queryConfig.accounts,
  })
}

export function useAccountsWithBalance() {
  return useQuery({
    queryKey: queryKeys.accounts.listWithBalance(),
    queryFn: async () => {
      const res = await unwrap<{ data: AccountWithBalance[] }>(
        await client.accounts["with-balance"].$get()
      )
      return res.data
    },
    ...queryConfig.accounts,
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: async () =>
      unwrap<Account>(
        await client.accounts[":id"].$get({ param: { id } })
      ),
    enabled: !!id,
    ...queryConfig.accounts,
  })
}

export function useAccountTypes() {
  return useQuery({
    queryKey: queryKeys.accountTypes.all,
    queryFn: async () => {
      const res = await unwrap<{ data: AccountType[] }>(
        await client.reference["account-types"].$get()
      )
      return res.data
    },
    ...queryConfig.accountTypes,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      customized_name?: string
      account_type_id: string
      bank_id: string
      balance?: string | number
      icon_url?: string
      is_default?: boolean
    }) => unwrap<Account>(await client.accounts.$post({ json: data })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        name: string
        customized_name?: string
        account_type_id: string
        bank_id: string
        balance?: string | number
        icon_url?: string
        is_default?: boolean
      }>
    }) =>
      unwrap<Account>(
        await client.accounts[":id"].$put({ param: { id }, json: data })
      ),
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
    mutationFn: async (id: string) =>
      unwrap<{ success: boolean }>(
        await client.accounts[":id"].$delete({ param: { id } })
      ),
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
