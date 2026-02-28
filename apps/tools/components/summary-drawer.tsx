"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { Separator } from "@/components/ui/separator";
import { calculateSplits } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currencies";
import type { SessionData } from "@/hooks/use-session";
import { Check, ChevronUp, Loader2 } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-client";
import { useState } from "react";
import { sileo } from "sileo";
import { Drawer as DrawerPrimitive } from "vaul";

export function SummaryDrawer({
  sessionId,
  session,
  currentMemberId,
  myTotal,
  myClaimedCount,
}: {
  sessionId: string;
  session: SessionData;
  currentMemberId: string;
  myTotal: number;
  myClaimedCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const isCreator = session.members.find(
    (m) => m.id === currentMemberId
  )?.isCreator;

  const splits = calculateSplits(
    session.members,
    session.items,
    Number(session.tax),
    Number(session.tip)
  );

  const billSubtotal = session.items.reduce(
    (s, i) => s + Number(i.price) * Number(i.quantity),
    0
  );
  const billTotal = billSubtotal + Number(session.tax) + Number(session.tip);

  const paidSplits = splits.filter(
    (s) => session.members.find((m) => m.id === s.memberId)?.isPaid
  );
  const pendingSplits = splits.filter(
    (s) => !session.members.find((m) => m.id === s.memberId)?.isPaid
  );

  const paidTotal = paidSplits.reduce((s, p) => s + p.total, 0);
  const pendingTotal = pendingSplits.reduce((s, p) => s + p.total, 0);

  const unclaimedItems = session.items.filter((i) => i.claims.length === 0);
  const unclaimedCount = unclaimedItems.length;
  const unclaimedTotal = unclaimedItems.reduce(
    (s, i) => s + Number(i.price) * Number(i.quantity),
    0
  );

  async function togglePaid(memberId: string, isPaid: boolean) {
    setTogglingId(memberId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, isPaid }),
      });
      if (!res.ok) throw new Error("Failed");
      const name = session.members.find((m) => m.id === memberId)?.name;
      if (isPaid) {
        sileo.success({ title: `${name} marked as paid` });
      } else {
        sileo.info({ title: `${name} marked as pending` });
      }
    } catch {
      sileo.error({ title: "Failed to update" });
    } finally {
      setTogglingId(null);
    }
  }

  function MemberRow({
    split,
    isPaid,
  }: {
    split: (typeof splits)[0];
    isPaid: boolean;
  }) {
    const m = session.members.find((mem) => mem.id === split.memberId);
    const isMe = currentMemberId === split.memberId;

    return (
      <div className="flex items-center gap-3 py-2">
        {m && (
          <MemberAvatar seed={m.avatarSeed} name={split.memberName} size={32} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {split.memberName}
            {isMe && <span className="text-muted-foreground"> (you)</span>}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(split.subtotal, session.currency)}
            {split.taxShare > 0 &&
              ` + ${formatCurrency(split.taxShare, session.currency)} tax`}
            {split.tipShare > 0 &&
              ` + ${formatCurrency(split.tipShare, session.currency)} tip`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <NumberFlow
            value={split.total}
            format={{
              style: "currency",
              currency: session.currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }}
            className={`text-sm font-bold tabular-nums ${isPaid ? "line-through text-muted-foreground" : ""}`}
          />
          {isCreator && (
            <button
              type="button"
              onClick={() => togglePaid(split.memberId, !isPaid)}
              disabled={togglingId === split.memberId}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                isPaid
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-muted-foreground/30 hover:border-muted-foreground/50"
              }`}
            >
              {togglingId === split.memberId ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isPaid ? (
                <Check className="w-3.5 h-3.5" />
              ) : null}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed bottom bar — tap to open */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card safe-area-bottom"
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs text-muted-foreground">
              Your total ({myClaimedCount} item
              {myClaimedCount !== 1 && "s"})
            </p>
            <NumberFlow
              value={myTotal}
              format={{
                style: "currency",
                currency: session.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }}
              className="text-2xl font-bold tabular-nums"
              willChange
            />
          </div>
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        </div>
      </button>

      {/* Modal drawer — opens on tap, swipe down to close */}
      <DrawerPrimitive.Root open={open} onOpenChange={setOpen}>
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <DrawerPrimitive.Content
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85svh] flex-col rounded-t-xl border-t bg-background"
            style={{ outline: "none" }}
            aria-describedby={undefined}
          >
            <DrawerPrimitive.Title className="sr-only">
              Summary
            </DrawerPrimitive.Title>

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
              <div className="max-w-lg mx-auto px-4 pb-10 flex flex-col gap-5">
                {/* Your total */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Your total ({myClaimedCount} item
                    {myClaimedCount !== 1 && "s"})
                  </p>
                  <NumberFlow
                    value={myTotal}
                    format={{
                      style: "currency",
                      currency: session.currency,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }}
                    className="text-3xl font-bold tabular-nums"
                    willChange
                  />
                </div>

                {/* Bill total card */}
                <div className="bg-card border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Bill total</p>
                      <NumberFlow
                        value={billTotal}
                        format={{
                          style: "currency",
                          currency: session.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }}
                        className="text-2xl font-bold tabular-nums"
                        willChange
                      />
                    </div>
                    <div className="text-right text-xs text-muted-foreground space-y-0.5">
                      <p>
                        Subtotal{" "}
                        {formatCurrency(billSubtotal, session.currency)}
                      </p>
                      {Number(session.tax) > 0 && (
                        <p>
                          Tax{" "}
                          {formatCurrency(Number(session.tax), session.currency)}
                        </p>
                      )}
                      {Number(session.tip) > 0 && (
                        <p>
                          Tip{" "}
                          {formatCurrency(Number(session.tip), session.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Pending</span>
                    </div>
                    <NumberFlow
                      value={pendingTotal}
                      format={{
                        style: "currency",
                        currency: session.currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                      className="font-semibold tabular-nums"
                      willChange
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">Paid</span>
                    </div>
                    <NumberFlow
                      value={paidTotal}
                      format={{
                        style: "currency",
                        currency: session.currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                      className="font-semibold tabular-nums text-green-600 dark:text-green-400"
                      willChange
                    />
                  </div>
                  {unclaimedTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <span className="text-muted-foreground">Unclaimed</span>
                      </div>
                      <NumberFlow
                        value={unclaimedTotal}
                        format={{
                          style: "currency",
                          currency: session.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }}
                        className="font-semibold tabular-nums text-destructive"
                        willChange
                      />
                    </div>
                  )}
                </div>

                {/* Pending section */}
                {pendingSplits.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pending ({pendingSplits.length})
                      </h2>
                      <NumberFlow
                        value={pendingTotal}
                        format={{
                          style: "currency",
                          currency: session.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }}
                        className="text-xs font-medium text-muted-foreground tabular-nums"
                      />
                    </div>
                    <div className="bg-card border rounded-xl px-4 divide-y">
                      <AnimatePresence initial={false}>
                        {pendingSplits.map((split) => (
                          <m.div
                            key={split.memberId}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          >
                            <MemberRow split={split} isPaid={false} />
                          </m.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Paid section */}
                {paidSplits.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                        Paid ({paidSplits.length})
                      </h2>
                      <NumberFlow
                        value={paidTotal}
                        format={{
                          style: "currency",
                          currency: session.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }}
                        className="text-xs font-medium text-green-600 dark:text-green-400 tabular-nums"
                      />
                    </div>
                    <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl px-4 divide-y divide-green-200 dark:divide-green-900">
                      <AnimatePresence initial={false}>
                        {paidSplits.map((split) => (
                          <m.div
                            key={split.memberId}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          >
                            <MemberRow split={split} isPaid={true} />
                          </m.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Unclaimed warning */}
                {unclaimedCount > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center">
                    <p className="text-sm text-destructive font-medium">
                      {unclaimedCount} item
                      {unclaimedCount !== 1 && "s"} still unclaimed
                    </p>
                  </div>
                )}

                {/* Creator hint */}
                {isCreator && (
                  <p className="text-xs text-muted-foreground text-center">
                    Tap the circle next to each person to mark them as paid
                  </p>
                )}

                {/* All paid celebration */}
                {pendingSplits.length === 0 && paidSplits.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-4 text-center">
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Everyone has paid!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    </>
  );
}
