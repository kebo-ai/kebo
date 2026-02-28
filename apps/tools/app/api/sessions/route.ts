import { db } from "@/db";
import { items, members, sessions } from "@/db/schema";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    title,
    currency = "USD",
    tax = 0,
    tip = 0,
    items: itemList,
    creator,
  } = body as {
    title?: string;
    currency?: string;
    tax?: number;
    tip?: number;
    items: { name: string; price: number; quantity?: number }[];
    creator: { fingerprint: string; name: string };
  };

  const sessionId = nanoid(10);
  const memberId = nanoid();

  await db.transaction(async (tx) => {
    await tx.insert(sessions).values({
      id: sessionId,
      creatorFingerprint: creator.fingerprint,
      title: title || null,
      currency,
      tax: String(tax),
      tip: String(tip),
      status: "active",
    });
    await tx.insert(members).values({
      id: memberId,
      sessionId,
      fingerprint: creator.fingerprint,
      name: creator.name,
      avatarSeed: nanoid(8),
      isCreator: true,
      isPaid: true,
    });
    await tx.insert(items).values(
      itemList.map((item) => ({
        id: nanoid(),
        sessionId,
        name: item.name,
        price: String(item.price),
        quantity: String(item.quantity ?? 1),
      }))
    );
  });

  return NextResponse.json({ id: sessionId, memberId });
}
