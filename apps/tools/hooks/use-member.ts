"use client";

import { useFingerprint } from "@/providers/fingerprint-provider";
import { useEffect, useState } from "react";

type StoredMember = {
  id: string;
  name: string;
  avatarSeed: string;
};

function storageKey(sessionId: string) {
  return `divvy:member:${sessionId}`;
}

export function useCurrentMember(sessionId: string) {
  const fingerprint = useFingerprint();
  const [member, setMember] = useState<StoredMember | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(sessionId));
    if (stored) {
      try {
        setMember(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [sessionId]);

  function saveMember(m: StoredMember) {
    localStorage.setItem(storageKey(sessionId), JSON.stringify(m));
    setMember(m);
  }

  return { member, fingerprint, saveMember };
}
