"use client";

import type { SessionData } from "@/hooks/use-session";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClaimItem(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      memberId,
    }: {
      itemId: string;
      memberId: string;
    }) => {
      const res = await fetch(`/api/sessions/${sessionId}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, memberId }),
      });
      if (!res.ok) throw new Error("Failed to claim");
    },
    onMutate: async ({ itemId, memberId }) => {
      await queryClient.cancelQueries({ queryKey: ["session", sessionId] });
      const prev = queryClient.getQueryData<SessionData>([
        "session",
        sessionId,
      ]);

      if (prev) {
        const member = prev.members.find((m) => m.id === memberId);
        if (member) {
          queryClient.setQueryData<SessionData>(["session", sessionId], {
            ...prev,
            items: prev.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    claims: [
                      ...item.claims,
                      {
                        itemId,
                        memberId,
                        member: {
                          id: member.id,
                          name: member.name,
                          avatarSeed: member.avatarSeed,
                        },
                      },
                    ],
                  }
                : item
            ),
          });
        }
      }

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["session", sessionId], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });
}

export function useUnclaimItem(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      memberId,
    }: {
      itemId: string;
      memberId: string;
    }) => {
      const res = await fetch(`/api/sessions/${sessionId}/claims`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, memberId }),
      });
      if (!res.ok) throw new Error("Failed to unclaim");
    },
    onMutate: async ({ itemId, memberId }) => {
      await queryClient.cancelQueries({ queryKey: ["session", sessionId] });
      const prev = queryClient.getQueryData<SessionData>([
        "session",
        sessionId,
      ]);

      if (prev) {
        queryClient.setQueryData<SessionData>(["session", sessionId], {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  claims: item.claims.filter((c) => c.memberId !== memberId),
                }
              : item
          ),
        });
      }

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["session", sessionId], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });
}
