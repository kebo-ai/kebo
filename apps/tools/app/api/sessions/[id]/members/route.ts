import { db } from "@/db";
import { members } from "@/db/schema";
import { checkRateLimit } from "@/lib/ratelimit";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await checkRateLimit(req);
  if (limited) return limited;

  const { id: sessionId } = await params;
  const { fingerprint, name } = (await req.json()) as {
    fingerprint: string;
    name: string;
  };

  const memberId = nanoid();
  const member = {
    id: memberId,
    sessionId,
    fingerprint,
    name,
    avatarSeed: nanoid(8),
    isCreator: false,
  };

  await db.insert(members).values(member);

  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const { memberId, isPaid } = (await req.json()) as {
    memberId: string;
    isPaid: boolean;
  };

  await db
    .update(members)
    .set({ isPaid })
    .where(and(eq(members.id, memberId), eq(members.sessionId, sessionId)));

  return NextResponse.json({ ok: true });
}
