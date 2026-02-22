"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import type {
  Transaction,
  CreateTransactionInput,
  CreateTransferInput,
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
    queryKey: ["transactions", filters],
    queryFn: () => api.get<TransactionsResponse>(endpoint),
  })
}

export function useRecentTransactions(limit: number = 5) {
  return useTransactions({ limit })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => api.get<Transaction>(`/transactions/${id}`),
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      api.post<Transaction>("/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["balance"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
    },
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferInput) =>
      api.post<Transaction>("/transactions/transfer", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["balance"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["balance"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["balance"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
    },
  })
}
