"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import type { Account, AccountWithBalance, CreateAccountInput, AccountType } from "../types"

interface DataResponse<T> {
  data: T
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await api.get<DataResponse<Account[]>>("/accounts")
      return response.data
    },
  })
}

export function useAccountsWithBalance() {
  return useQuery({
    queryKey: ["accounts", "with-balance"],
    queryFn: async () => {
      const response = await api.get<DataResponse<AccountWithBalance[]>>("/accounts/with-balance")
      return response.data
    },
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => api.get<Account>(`/accounts/${id}`),
    enabled: !!id,
  })
}

export function useAccountTypes() {
  return useQuery({
    queryKey: ["account-types"],
    queryFn: async () => {
      const response = await api.get<DataResponse<AccountType[]>>("/reference/account-types")
      return response.data
    },
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccountInput) =>
      api.post<Account>("/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["balance"] })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAccountInput> }) =>
      api.put<Account>(`/accounts/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["account", variables.id] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["balance"] })
    },
  })
}
