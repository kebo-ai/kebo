import { useQuery } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { UserBalance } from "../types"

const client = getApiClient()

export function useBalance() {
  return useQuery({
    queryKey: queryKeys.balance.all,
    queryFn: async () =>
      unwrap<UserBalance>(await client.transactions.balance.$get()),
    ...queryConfig.balance,
  })
}
