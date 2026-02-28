"use client";

import { MemberAvatar } from "@/components/member-avatar";
import NumberFlow from "@number-flow/react";
import * as m from "motion/react-client";
import { AnimatePresence } from "motion/react";

type Member = {
  id: string;
  name: string;
  avatarSeed: string;
  isCreator: boolean;
};

export function MemberList({
  members,
  currentMemberId,
  selectedMemberId,
  onMemberSelect,
  memberTotals,
  currency,
}: {
  members: Member[];
  currentMemberId?: string;
  selectedMemberId?: string | null;
  onMemberSelect?: (memberId: string | null) => void;
  memberTotals?: Map<string, number>;
  currency?: string;
}) {
  return (
    <div className="flex items-start gap-2 overflow-x-auto py-2">
      {members.map((member, i) => {
        const isSelected = selectedMemberId === member.id;
        const isCurrent = member.id === currentMemberId;
        const hasRing = isCurrent || isSelected;
        const total = memberTotals?.get(member.id) ?? 0;

        return (
          <m.div
            key={member.id}
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: i * 0.05,
            }}
            className="flex flex-col items-center gap-1 w-14 shrink-0"
          >
            <button
              type="button"
              onClick={() =>
                onMemberSelect?.(isSelected ? null : member.id)
              }
              className={`rounded-full transition-shadow ${
                hasRing ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}
            >
              <MemberAvatar seed={member.avatarSeed} name={member.name} size={36} />
            </button>
            <span className="text-xs text-muted-foreground truncate w-full text-center">
              {member.name}
              {member.isCreator && " ★"}
            </span>
            <div className="h-3.5 w-full overflow-clip flex items-center justify-center">
              <AnimatePresence>
                {isSelected && currency && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <NumberFlow
                      value={total}
                      format={{
                        style: "currency",
                        currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                      className="text-[10px] font-semibold text-primary tabular-nums whitespace-nowrap"
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        );
      })}
    </div>
  );
}
