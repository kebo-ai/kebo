"use client"

import { queryKeys } from "@/lib/api/keys"
import { useRealtimeSync } from "./use-realtime-sync"

function RealtimeSubscriptions() {
  useRealtimeSync({
    table: "transactions",
    invalidateKeys: [
      queryKeys.transactions.all,
      queryKeys.balance.all,
      queryKeys.accounts.all,
      queryKeys.reports.all,
      queryKeys.budgets.all,
    ],
  })

  useRealtimeSync({
    table: "accounts",
    invalidateKeys: [
      queryKeys.accounts.all,
      queryKeys.balance.all,
    ],
  })

  useRealtimeSync({
    table: "categories_users",
    invalidateKeys: [
      queryKeys.categories.all,
      queryKeys.reports.all,
    ],
  })

  useRealtimeSync({
    table: "budgets_users",
    invalidateKeys: [queryKeys.budgets.all],
  })

  useRealtimeSync({
    table: "budget_lines",
    invalidateKeys: [queryKeys.budgets.all],
  })

  return null
}

export function RealtimeSyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <RealtimeSubscriptions />
      {children}
    </>
  )
}
