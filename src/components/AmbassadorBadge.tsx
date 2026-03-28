"use client";

import { ambassadorRanks } from "@/lib/mockData";

interface Props {
  level: number;
  region?: string;
  compact?: boolean;
}

export default function AmbassadorBadge({ level, region, compact }: Props) {
  if (!level || level < 1) return null;
  const rank = ambassadorRanks[level - 1];
  if (!rank) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center text-xs" title={`${rank.emoji} ${rank.name}`}>
        {rank.emoji}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
      {rank.emoji} {region || rank.name}
    </span>
  );
}
