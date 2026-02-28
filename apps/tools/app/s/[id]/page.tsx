"use client";

import { ItemCard } from "@/components/item-card";
import { MemberList } from "@/components/member-list";
import { SummaryDrawer } from "@/components/summary-drawer";
import { SessionHeader } from "@/components/session-header";
import { ShareDialog } from "@/components/share-dialog";
import { useClaimItem, useUnclaimItem } from "@/hooks/use-claims";
import { useCurrentMember } from "@/hooks/use-member";
import { useRealtimeSession } from "@/hooks/use-realtime";
import { useSession } from "@/hooks/use-session";
import { Loader2 } from "lucide-react";
import * as m from "motion/react-client";
import { use, useState } from "react";

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isLoading, error } = useSession(id);
  const { member } = useCurrentMember(id);
  const claimItem = useClaimItem(id);
  const unclaimItem = useUnclaimItem(id);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useRealtimeSession(id);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !session) {
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

  const sessionPaid = session.status === "paid";
  const currentMemberId = member?.id;
  const memberPaidMap = new Map(session.members.map((m) => [m.id, m.isPaid]));

  let mySubtotal = 0;
  let myClaimedCount = 0;
  const billSubtotal = session.items.reduce(
    (s, i) => s + Number(i.price) * Number(i.quantity),
    0
  );

  if (currentMemberId) {
    for (const item of session.items) {
      const isClaimed = item.claims.some(
        (c) => c.memberId === currentMemberId
      );
      if (isClaimed) {
        myClaimedCount++;
        const itemTotal = Number(item.price) * Number(item.quantity);
        mySubtotal += itemTotal / item.claims.length;
      }
    }
  }
  const memberTotals = new Map<string, number>();
  for (const item of session.items) {
    const itemTotal = Number(item.price) * Number(item.quantity);
    for (const claim of item.claims) {
      memberTotals.set(
        claim.memberId,
        (memberTotals.get(claim.memberId) ?? 0) + itemTotal / item.claims.length
      );
    }
  }

  const proportion = billSubtotal > 0 ? mySubtotal / billSubtotal : 0;
  const myTax = Number(session.tax) * proportion;
  const myTip = Number(session.tip) * proportion;
  const myTotal = mySubtotal + myTax + myTip;

  function handleToggleClaim(itemId: string) {
    if (!currentMemberId) return;
    const item = session!.items.find((i) => i.id === itemId);
    if (!item) return;
    const isMine = item.claims.some((c) => c.memberId === currentMemberId);
    const isTaken = item.claims.length > 0 && !isMine;
    if (isTaken) return;
    if (isMine) {
      unclaimItem.mutate({ itemId, memberId: currentMemberId });
    } else {
      claimItem.mutate({ itemId, memberId: currentMemberId });
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <SessionHeader
            title={session.title}
            status={session.status}
            onShare={() => setShareOpen(true)}
          />
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <MemberList
            members={session.members}
            currentMemberId={currentMemberId}
            selectedMemberId={selectedMemberId}
            onMemberSelect={setSelectedMemberId}
            memberTotals={memberTotals}
            currency={session.currency}
          />
        </m.div>

        {!currentMemberId && (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center"
          >
            <p className="text-sm font-medium">
              You&apos;re viewing this bill.{" "}
              <a href={`/s/${id}/join`} className="text-primary underline">
                Join to claim items
              </a>
            </p>
          </m.div>
        )}

        <div className="flex flex-col gap-2">
          {session.items.map((item, i) => (
            <m.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                delay: 0.15 + i * 0.04,
              }}
            >
              <ItemCard
                item={item}
                currency={session.currency}
                currentMemberId={currentMemberId}
                memberPaidMap={memberPaidMap}
                sessionPaid={sessionPaid}
                onToggleClaim={handleToggleClaim}
                dimmed={
                  selectedMemberId != null &&
                  !item.claims.some((c) => c.memberId === selectedMemberId)
                }
              />
            </m.div>
          ))}
        </div>

        {session.items.some((i) => i.claims.length === 0) && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground text-center"
          >
            {session.items.filter((i) => i.claims.length === 0).length} item
            {session.items.filter((i) => i.claims.length === 0).length !== 1 &&
              "s"}{" "}
            unclaimed
          </m.p>
        )}
      </div>

      {currentMemberId && (
        <SummaryDrawer
          sessionId={id}
          session={session}
          currentMemberId={currentMemberId}
          myTotal={myTotal}
          myClaimedCount={myClaimedCount}
        />
      )}

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        sessionId={id}
        title={session.title}
      />
    </div>
  );
}
