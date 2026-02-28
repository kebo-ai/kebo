"use client";

import { useQuery } from "@tanstack/react-query";

export type SessionData = {
  id: string;
  creatorFingerprint: string;
  title: string | null;
  currency: string;
  tax: string;
  tip: string;
  status: "active" | "paid";
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    name: string;
    price: string;
    quantity: string;
    isShared: boolean;
    claims: {
      itemId: string;
      memberId: string;
      member: {
        id: string;
        name: string;
        avatarSeed: string;
      };
    }[];
  }[];
  members: {
    id: string;
    fingerprint: string;
    name: string;
    avatarSeed: string;
    isCreator: boolean;
    isPaid: boolean;
  }[];
};

export function useSession(sessionId: string) {
  return useQuery<SessionData>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Session not found");
      return res.json();
    },
  });
}
