import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/config/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { wasMutationSettled } from "./invalidation-tracker"

interface UseRealtimeSyncOptions {
  table: string
  invalidateKeys: readonly (readonly unknown[])[]
  enabled?: boolean
}

export function useRealtimeSync({
  table,
  invalidateKeys,
  enabled = true,
}: UseRealtimeSyncOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    let channel: RealtimeChannel | null = null
    let authSubscription: { unsubscribe: () => void } | null = null

    function subscribe() {
      if (channel) {
        supabase.removeChannel(channel)
      }

      channel = supabase
        .channel(`realtime-${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => {
            if (wasMutationSettled(table)) return
            for (const key of invalidateKeys) {
              queryClient.invalidateQueries({ queryKey: key as unknown[] })
            }
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log(`[realtime] ${table}: SUBSCRIBED`)
          } else if (status === "CHANNEL_ERROR") {
            console.error(`[realtime] ${table}: CHANNEL_ERROR`, err?.message)
          } else if (status === "TIMED_OUT") {
            console.warn(`[realtime] ${table}: TIMED_OUT`)
          }
        })
    }

    // Only subscribe if we have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.warn(`[realtime] ${table}: skipping, no session`)
        return
      }
      subscribe()
    })

    // Re-subscribe when auth state changes (e.g. token refresh)
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        subscribe()
      }
    })
    authSubscription = data.subscription

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      authSubscription?.unsubscribe()
    }
  }, [table, enabled]) // eslint-disable-line react-hooks/exhaustive-deps
}
