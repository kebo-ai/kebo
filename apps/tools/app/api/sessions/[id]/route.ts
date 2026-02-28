import { db } from "@/db";
import { sessions } from "@/db/schema";
import { checkRateLimit } from "@/lib/ratelimit";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await checkRateLimit(_req);
  if (limited) return limited;

  const { id } = await params;

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: {
      items: {
        with: { claims: { with: { member: true } } },
      },
      members: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited2 = await checkRateLimit(req);
  if (limited2) return limited2;

  const { id } = await params;
  const body = await req.json();
  const { tax, tip, status } = body as {
    tax?: number;
    tip?: number;
    status?: "active" | "paid";
  };

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (tax !== undefined) updates.tax = String(tax);
  if (tip !== undefined) updates.tip = String(tip);
  if (status !== undefined) updates.status = status;

  await db.update(sessions).set(updates).where(eq(sessions.id, id));

  return NextResponse.json({ ok: true });
}
