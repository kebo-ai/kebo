"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import type { Bank, CreateBankInput } from "../types"

interface DataResponse<T> {
  data: T
}

export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank[]>>("/banks")
      return response.data
    },
  })
}

export function useBanksByCountry(countryCode: string) {
  return useQuery({
    queryKey: ["banks", countryCode],
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank[]>>(`/banks?country=${countryCode}`)
      return response.data
    },
    enabled: !!countryCode,
  })
}

export function useSearchBanks(query: string) {
  return useQuery({
    queryKey: ["banks", "search", query],
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank[]>>(`/banks?search=${encodeURIComponent(query)}`)
      return response.data
    },
    enabled: query.length > 0,
  })
}

export function useBank(id: string) {
  return useQuery({
    queryKey: ["bank", id],
    queryFn: async () => {
      const response = await api.get<DataResponse<Bank>>(`/banks/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBankInput) => api.post<Bank>("/banks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] })
    },
  })
}

export function useUpdateBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBankInput> }) =>
      api.put<Bank>(`/banks/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banks"] })
      queryClient.invalidateQueries({ queryKey: ["bank", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })
}

export function useDeleteBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/banks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] })
    },
  })
}
