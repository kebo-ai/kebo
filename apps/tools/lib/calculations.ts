export type ClaimWithItem = {
  itemId: string;
  memberId: string;
  item: { price: string; quantity: string };
};

export type MemberSplit = {
  memberId: string;
  memberName: string;
  subtotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
};

export function calculateSplits(
  members: { id: string; name: string }[],
  items: {
    id: string;
    price: string;
    quantity: string;
    claims: { memberId: string }[];
  }[],
  tax: number,
  tip: number
): MemberSplit[] {
  // Calculate bill subtotal (all items)
  const billSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (billSubtotal === 0) {
    return members.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      subtotal: 0,
      taxShare: 0,
      tipShare: 0,
      total: 0,
    }));
  }

  // Calculate each member's subtotal based on claimed items
  const memberSubtotals = new Map<string, number>();
  for (const member of members) {
    memberSubtotals.set(member.id, 0);
  }

  for (const item of items) {
    const itemTotal = Number(item.price) * Number(item.quantity);
    const claimers = item.claims.length;
    if (claimers === 0) continue;
    const perPerson = itemTotal / claimers;
    for (const claim of item.claims) {
      memberSubtotals.set(
        claim.memberId,
        (memberSubtotals.get(claim.memberId) ?? 0) + perPerson
      );
    }
  }

  return members.map((m) => {
    const subtotal = memberSubtotals.get(m.id) ?? 0;
    const proportion = subtotal / billSubtotal;
    const taxShare = tax * proportion;
    const tipShare = tip * proportion;
    return {
      memberId: m.id,
      memberName: m.name,
      subtotal: round2(subtotal),
      taxShare: round2(taxShare),
      tipShare: round2(tipShare),
      total: round2(subtotal + taxShare + tipShare),
    };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
