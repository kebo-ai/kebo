import { db } from "@/db";
import { claims } from "@/db/schema";
import { checkRateLimit } from "@/lib/ratelimit";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const limited = await checkRateLimit(req);
  if (limited) return limited;

  const { itemId, memberId } = (await req.json()) as {
    itemId: string;
    memberId: string;
  };

  // Check if item is already claimed by someone else
  const existing = await db.query.claims.findFirst({
    where: eq(claims.itemId, itemId),
  });

  if (existing && existing.memberId !== memberId) {
    return NextResponse.json(
      { error: "Item already claimed" },
      { status: 409 }
    );
  }

  try {
    await db.insert(claims).values({ itemId, memberId });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: unknown) {
    if (
      e instanceof Error &&
      e.message.includes("duplicate key")
    ) {
      return NextResponse.json({ ok: true }); // Already claimed by same user
    }
    throw e;
  }
}

export async function DELETE(req: Request) {
  const limited2 = await checkRateLimit(req);
  if (limited2) return limited2;

  const { itemId, memberId } = (await req.json()) as {
    itemId: string;
    memberId: string;
  };

  await db
    .delete(claims)
    .where(and(eq(claims.itemId, itemId), eq(claims.memberId, memberId)));

  return NextResponse.json({ ok: true });
}
