"use client";

import * as m from "motion/react-client";
import { cn } from "@/lib/utils";

export function DivvyCharacter({
  size = 120,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const w = size;
  const h = size * 1.3;

  return (
    <m.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={cn("inline-flex", className)}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 120 156"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Receipt body */}
        <path
          d="M16 12C16 5.373 21.373 0 28 0h64c6.627 0 12 5.373 12 12v124l-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6V12Z"
          className="fill-primary"
        />
        {/* Left eye */}
        <circle cx="44" cy="52" r="6" className="fill-primary-foreground" />
        {/* Right eye */}
        <circle cx="76" cy="52" r="6" className="fill-primary-foreground" />
        {/* Smile */}
        <path
          d="M46 72c0 0 7 10 14 10s14-10 14-10"
          className="stroke-primary-foreground"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Receipt lines */}
        <rect x="36" y="92" width="48" height="3" rx="1.5" className="fill-primary-foreground" opacity="0.3" />
        <rect x="36" y="100" width="32" height="3" rx="1.5" className="fill-primary-foreground" opacity="0.3" />
      </svg>
    </m.div>
  );
}
