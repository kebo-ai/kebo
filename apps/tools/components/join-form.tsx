"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";
import { useMemo, useState } from "react";

export function JoinForm({
  onJoin,
  loading,
}: {
  onJoin: (name: string) => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const previewSeed = useMemo(() => nanoid(8), []);

  return (
    <div className="flex flex-col items-center gap-6">
      <MemberAvatar seed={previewSeed} name={name || "You"} size={80} />
      <div className="w-full max-w-xs space-y-4">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-center text-lg h-12"
          autoFocus
          maxLength={20}
        />
        <Button
          className="w-full h-12 text-base"
          disabled={!name.trim() || loading}
          onClick={() => onJoin(name.trim())}
        >
          {loading ? "Joining..." : "Join Bill"}
        </Button>
      </div>
    </div>
  );
}
