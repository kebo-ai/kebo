"use client";

import { supabase } from "@/lib/supabase";
import type { SessionData } from "@/hooks/use-session";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useRealtimeSession(sessionId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const invalidate = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      }, 100);
    };

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` },
        invalidate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items", filter: `session_id=eq.${sessionId}` },
        invalidate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members", filter: `session_id=eq.${sessionId}` },
        invalidate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "claims" },
        (payload) => {
          // claims has no session_id — check the cached session's item IDs
          const record = (
            payload.new && Object.keys(payload.new).length > 0
              ? payload.new
              : payload.old
          ) as Record<string, string>;
          const itemId = record?.item_id;
          if (!itemId) {
            invalidate();
            return;
          }

          const session = queryClient.getQueryData<SessionData>(["session", sessionId]);
          if (!session || session.items.some((i) => i.id === itemId)) {
            invalidate();
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);
}
