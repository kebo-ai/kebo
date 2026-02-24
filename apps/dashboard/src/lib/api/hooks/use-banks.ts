"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Bank, CreateBankInput } from "../types"

interface DataResponse<T> {
  data: T
}

export function useBanks() {
  return useQuery({
    queryKey: queryKeys.banks.list(),
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank[]>>("/banks")
      return response.data
    },
    ...queryConfig.banks,
  })
}

export function useBanksByCountry(countryCode: string) {
  return useQuery({
    queryKey: queryKeys.banks.byCountry(countryCode),
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank[]>>(
        `/banks?country=${countryCode}`
      )
      return response.data
    },
    enabled: !!countryCode,
    ...queryConfig.banks,
  })
}

export function useSearchBanks(query: string) {
  return useQuery({
    queryKey: queryKeys.banks.search(query),
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank[]>>(
        `/banks?search=${encodeURIComponent(query)}`
      )
      return response.data
    },
    enabled: query.length > 0,
    ...queryConfig.banks,
  })
}

export function useBank(id: string) {
  return useQuery({
    queryKey: queryKeys.banks.detail(id),
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank>>(`/banks/${id}`)
      return response.data
    },
    enabled: !!id,
    ...queryConfig.banks,
  })
}

export function useCreateBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBankInput) => api.post<Bank>("/banks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banks.all })
    },
  })
}

export function useUpdateBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateBankInput>
    }) => api.put<Bank>(`/banks/${id}`, data),
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
    mutationFn: (id: string) => api.delete(`/banks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banks.all })
    },
  })
}
