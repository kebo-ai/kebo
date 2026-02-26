import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query"
import { createClient } from "@/lib/auth/server"
import { createServerApiClient } from "@/lib/api/rpc-server"
import { unwrap } from "@/lib/api/rpc"
import { queryKeys } from "@/lib/api/keys"
import type { UserBalance, Account, Transaction } from "@/lib/api/types"
import { DashboardContent } from "./dashboard-content"

interface TransactionsResponse {
  data: Transaction[]
  total: number
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] || "there"

  if (session?.access_token) {
    const api = createServerApiClient(session.access_token)
    const queryClient = new QueryClient()

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.balance.all,
        queryFn: async () =>
          unwrap<UserBalance>(await api.transactions.balance.$get()),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.transactions.list({ limit: 5 } as Record<string, unknown>),
        queryFn: async () =>
          unwrap<TransactionsResponse>(
            await api.transactions.$get({ query: { limit: 5 } })
          ),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.accounts.list(),
        queryFn: async () => {
          const res = await unwrap<{ data: Account[] }>(
            await api.accounts.$get()
          )
          return res.data
        },
      }),
    ])

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardContent firstName={firstName} />
      </HydrationBoundary>
    )
  }

  return <DashboardContent firstName={firstName} />
}
