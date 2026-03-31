"use client";

import { AMBASSADOR_RANKS } from "@/config/ambassador";

interface Props {
  level: number;
  region?: string;
  compact?: boolean;
}

export default function AmbassadorBadge({ level, region, compact }: Props) {
  if (!level || level < 1) return null;
  const rank = AMBASSADOR_RANKS[level - 1];
  if (!rank) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center text-xs" title={`${rank.emoji} ${rank.name}`}>
        {rank.emoji}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
      {rank.emoji} {region || rank.name}
    </span>
  );
}
