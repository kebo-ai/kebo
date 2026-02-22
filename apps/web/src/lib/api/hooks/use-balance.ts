"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "../client"
import type { UserBalance } from "../types"

export function useBalance() {
  return useQuery({
    queryKey: ["balance"],
    queryFn: () => api.get<UserBalance>("/transactions/balance"),
  })
}
