import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApiClient, unwrap } from "../rpc"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"
import type { Profile } from "../types"

const client = getApiClient()

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async () =>
      unwrap<Profile>(await client.users.profile.$get()),
    ...queryConfig.profile,
  })
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
