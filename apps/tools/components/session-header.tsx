"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function SessionHeader({
  title,
  status,
  onShare,
}: {
  title: string | null;
  status: "active" | "paid";
  onShare: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-xl font-display truncate">
          {title || "Bill Split"}
        </h1>
        {status === "paid" && (
          <Badge variant="secondary" className="flex-shrink-0">
            Paid
          </Badge>
        )}
      </div>
      <Button variant="outline" size="icon" onClick={onShare}>
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
