import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query"
import { createClient } from "@/lib/auth/server"
import { createServerApi } from "@/lib/api/server"
import { queryKeys } from "@/lib/api/keys"
import type { UserBalance, Account, Transaction } from "@/lib/api/types"
import { DashboardContent } from "./dashboard-content"

interface DataResponse<T> {
  data: T
}

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
    const api = createServerApi(session.access_token)
    const queryClient = new QueryClient()

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.balance.all,
        queryFn: () => api.get<UserBalance>("/transactions/balance"),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.transactions.list({ limit: 5 } as Record<string, unknown>),
        queryFn: () =>
          api.get<TransactionsResponse>("/transactions?limit=5"),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.accounts.list(),
        queryFn: async () => {
          const response = await api.get<DataResponse<Account[]>>("/accounts")
          return response.data
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
