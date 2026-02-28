"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import NumberFlow from "@number-flow/react";
import * as m from "motion/react-client";
import { AnimatePresence } from "motion/react";

type Claim = {
  memberId: string;
  member: { id: string; name: string; avatarSeed: string };
};

export function ItemCard({
  item,
  currency,
  currentMemberId,
  memberPaidMap,
  sessionPaid,
  onToggleClaim,
  dimmed,
}: {
  item: {
    id: string;
    name: string;
    price: string;
    quantity: string;
    claims: Claim[];
  };
  currency: string;
  currentMemberId?: string;
  memberPaidMap: Map<string, boolean>;
  sessionPaid: boolean;
  onToggleClaim: (itemId: string) => void;
  dimmed?: boolean;
}) {
  const isMine = item.claims.some((c) => c.memberId === currentMemberId);
  const takenBy = item.claims.length > 0 ? item.claims[0] : null;
  const isTaken = !!takenBy && !isMine;
  const claimerPaid = takenBy
    ? (memberPaidMap.get(takenBy.memberId) ?? false)
    : false;
  const isDisabled = sessionPaid || !currentMemberId || isTaken;
  const total = Number(item.price) * Number(item.quantity);

  return (
    <m.button
      type="button"
      onClick={() => !isDisabled && onToggleClaim(item.id)}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex items-center justify-between w-full p-3 rounded-xl border transition-colors ${
        claimerPaid
          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
          : isMine
            ? "border-primary bg-primary/5"
            : isTaken
              ? "border-border bg-muted/50"
              : "border-border bg-card hover:bg-accent/50"
      } ${dimmed ? "opacity-30 grayscale pointer-events-none cursor-default" : isDisabled ? "opacity-60 cursor-default" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <m.div
          animate={{
            scale: isMine || claimerPaid ? 1.05 : 1,
            backgroundColor:
              claimerPaid
                ? "var(--color-green-500, #22c55e)"
                : isMine
                  ? "var(--color-primary)"
                  : isTaken
                    ? "var(--color-muted)"
                    : "transparent",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 ${
            claimerPaid
              ? "border-green-500 text-white"
              : isMine
                ? "border-primary text-primary-foreground"
                : isTaken
                  ? "border-muted-foreground/20"
                  : "border-muted-foreground/30"
          }`}
        >
          <AnimatePresence>
            {(isMine || isTaken || claimerPaid) && (
              <m.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="w-3.5 h-3.5" />
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
        <div className="text-left min-w-0">
          <p
            className={`font-medium text-sm truncate ${isTaken && !claimerPaid ? "text-muted-foreground" : ""}`}
          >
            {item.name}
          </p>
          {takenBy && (isTaken || claimerPaid) && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {takenBy.member.name}
              </span>
              {claimerPaid && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  Paid
                </Badge>
              )}
            </div>
          )}
          {!isTaken && !claimerPaid && Number(item.quantity) > 1 && (
            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <AnimatePresence>
          {item.claims.length > 0 && (
            <m.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <MemberAvatar
                seed={item.claims[0].member.avatarSeed}
                name={item.claims[0].member.name}
                size={22}
                className="border-2 border-background"
              />
            </m.div>
          )}
        </AnimatePresence>
        <NumberFlow
          value={total}
          format={{ style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          className={`font-semibold text-sm tabular-nums ${claimerPaid ? "line-through text-muted-foreground" : ""}`}
        />
      </div>
    </m.button>
  );
}
