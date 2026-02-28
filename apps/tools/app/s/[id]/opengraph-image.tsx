import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const alt = "Divvy - Split the Bill";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: { items: true, members: true },
  });

  const title = session?.title || "Bill Split";
  const memberCount = session?.members.length ?? 0;
  const itemCount = session?.items.length ?? 0;

  const logoSrc = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/divvy-animals.png")).toString("base64")}`;

  const [geist, geistMedium, instrumentSerif] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/geist/v4/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf"
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/geist/v4/gyBhhwUxId8gMGYQMKR3pzfaWI_RruM4nQ.ttf"
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf"
    ).then((r) => r.arrayBuffer()),
  ]);

  const stats =
    memberCount > 0 || itemCount > 0
      ? `${memberCount} ${memberCount === 1 ? "person" : "people"} · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#070707",
          padding: "60px",
        }}
      >
        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: "24px",
          }}
        >
          {/* Session title */}
          <div
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 64,
              color: "#f5f5e9",
              textAlign: "center",
              lineHeight: 1.1,
              maxWidth: "900px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>

          {/* Stats */}
          {stats && (
            <div
              style={{
                fontFamily: "Geist",
                fontSize: 24,
                color: "#808080",
              }}
            >
              {stats}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #222222",
            paddingTop: "24px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="Divvy" height={40} />
          <div
            style={{
              fontFamily: "Geist",
              fontSize: 20,
              color: "#808080",
            }}
          >
            Split the bill, not the friendship.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geist, weight: 400 as const },
        { name: "Geist Medium", data: geistMedium, weight: 500 as const },
        {
          name: "Instrument Serif",
          data: instrumentSerif,
          weight: 400 as const,
        },
      ],
    }
  );
}
