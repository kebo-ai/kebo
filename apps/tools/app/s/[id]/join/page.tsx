"use client";

import { DivvyCharacter } from "@/components/divvy-character";
import { JoinForm } from "@/components/join-form";
import { useCurrentMember } from "@/hooks/use-member";
import { useSession } from "@/hooks/use-session";
import { useFingerprint } from "@/providers/fingerprint-provider";
import { Loader2 } from "lucide-react";
import * as m from "motion/react-client";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function JoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fingerprint = useFingerprint();
  const { data: session, isLoading } = useSession(id);
  const { member, saveMember } = useCurrentMember(id);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (member) {
      router.replace(`/s/${id}`);
    }
  }, [member, id, router]);

  async function handleJoin(name: string) {
    if (!fingerprint) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/sessions/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint, name }),
      });
      if (!res.ok) throw new Error("Failed to join");
      const m = await res.json();
      saveMember({ id: m.id, name: m.name, avatarSeed: m.avatarSeed });
      router.replace(`/s/${id}`);
    } catch {
      setJoining(false);
    }
  }

  if (isLoading || member) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Session not found</p>
          <p className="text-muted-foreground text-sm mt-1">
            This bill may have been deleted or the link is wrong.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <m.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <m.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          >
            <DivvyCharacter size={80} />
          </m.div>
          <h1 className="text-2xl font-display">
            {session.title || "Bill Split"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {session.members.length} member
            {session.members.length !== 1 && "s"} ·{" "}
            {session.items.length} item
            {session.items.length !== 1 && "s"}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.2 }}
        >
          <JoinForm onJoin={handleJoin} loading={joining || !fingerprint} />
        </m.div>
      </div>
    </div>
  );
}
