"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "../client"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { UserBalance } from "../types"

export function useBalance() {
  return useQuery({
    queryKey: queryKeys.balance.all,
    queryFn: () => api.get<UserBalance>("/transactions/balance"),
    ...queryConfig.balance,
  })
}
