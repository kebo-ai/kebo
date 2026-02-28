"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import { useMemo } from "react";

export function MemberAvatar({
  seed,
  name,
  size = 32,
  className,
}: {
  seed: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const avatarUrl = useMemo(() => {
    const avatar = createAvatar(thumbs, {
      seed,
      size: 64,
    });
    return avatar.toDataUri();
  }, [seed]);

  return (
    <Avatar
      className={className}
      style={{ width: size, height: size }}
    >
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback className="text-xs">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
