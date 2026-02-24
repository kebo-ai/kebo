"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/auth/client"
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

    const supabase = createClient()
    let channel: RealtimeChannel

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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, enabled]) // eslint-disable-line react-hooks/exhaustive-deps
}
