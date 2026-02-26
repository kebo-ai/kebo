"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Bank } from "../types"

const client = getApiClient()

export function useBanks() {
  return useQuery({
    queryKey: queryKeys.banks.list(),
    queryFn: async () => {
      const res = await unwrap<{ data: Bank[] }>(await client.banks.$get())
      return res.data
    },
    ...queryConfig.banks,
  })
}

export function useBanksByCountry(countryCode: string) {
  return useQuery({
    queryKey: queryKeys.banks.byCountry(countryCode),
    queryFn: async () => {
      const res = await unwrap<{ data: Bank[] }>(
        await client.banks.country[":code"].$get({
          param: { code: countryCode },
        })
      )
      return res.data
    },
    enabled: !!countryCode,
    ...queryConfig.banks,
  })
}

export function useSearchBanks(query: string) {
  return useQuery({
    queryKey: queryKeys.banks.search(query),
    queryFn: async () => {
      const res = await unwrap<{ data: Bank[] }>(
        await client.banks.search.$get({ query: { q: query } })
      )
      return res.data
    },
    enabled: query.length > 0,
    ...queryConfig.banks,
  })
}

export function useBank(id: string) {
  return useQuery({
    queryKey: queryKeys.banks.detail(id),
    queryFn: async () => {
      const res = await unwrap<{ data: Bank }>(
        await client.banks[":id"].$get({ param: { id } })
      )
      return res.data
    },
    enabled: !!id,
    ...queryConfig.banks,
  })
}

export function useCreateBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      country_code?: string
      open_finance_integrated?: boolean
      bank_url?: string
      description?: string
      country_flag?: string
    }) => unwrap<{ data: Bank }>(await client.banks.$post({ json: data })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banks.all })
    },
  })
}

export function useUpdateBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        name: string
        country_code?: string
        open_finance_integrated?: boolean
        bank_url?: string
        description?: string
        country_flag?: string
      }>
    }) =>
      unwrap<{ data: Bank }>(
        await client.banks[":id"].$put({ param: { id }, json: data })
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banks.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.banks.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
    },
  })
}

export function useDeleteBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<{ success: boolean }>(
        await client.banks[":id"].$delete({ param: { id } })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banks.all })
    },
  })
}
