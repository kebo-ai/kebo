import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Category, Profile } from "../types"

const client = getApiClient()

export function useProfile() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async () =>
      unwrap<Profile>(await client.users.profile.$get()),
    ...queryConfig.profile,
  })

  // After profile loads, refetch categories/accounts if they're empty.
  // ensureProfile creates defaults for new users, but those queries
  // may have fired before the defaults were created.
  useEffect(() => {
    if (query.data) {
      const cached = queryClient.getQueryData<Category[]>(queryKeys.categories.list())
      if (!cached || cached.length === 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      }
    }
  }, [query.data, queryClient])

  return query
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      full_name?: string
      country?: string
      currency?: string
      avatar_url?: string
    }) => unwrap<Profile>(await client.users.profile.$put({ json: data })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    },
  })
}

export function useDeleteUserAccount() {
  return useMutation({
    mutationFn: async () =>
      unwrap<{ success: boolean; message: string }>(
        await client.users.$delete()
      ),
  })
}
