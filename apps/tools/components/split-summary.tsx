"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currencies";
import type { MemberSplit } from "@/lib/calculations";

export function SplitSummary({
  splits,
  currency,
  members,
}: {
  splits: MemberSplit[];
  currency: string;
  members: { id: string; avatarSeed: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {splits.map((split) => {
        const m = members.find((mem) => mem.id === split.memberId);
        return (
          <Card key={split.memberId}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {m && (
                  <MemberAvatar
                    seed={m.avatarSeed}
                    name={split.memberName}
                    size={36}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{split.memberName}</p>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {formatCurrency(split.total, currency)}
                </p>
              </div>
              <Separator className="mb-3" />
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs">Items</p>
                  <p className="font-medium text-foreground tabular-nums">
                    {formatCurrency(split.subtotal, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs">Tax</p>
                  <p className="font-medium text-foreground tabular-nums">
                    {formatCurrency(split.taxShare, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs">Tip</p>
                  <p className="font-medium text-foreground tabular-nums">
                    {formatCurrency(split.tipShare, currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
