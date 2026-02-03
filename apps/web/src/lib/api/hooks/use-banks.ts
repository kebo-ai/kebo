"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "../client"
import type { Bank } from "../types"

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
