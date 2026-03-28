"use client";

interface Props {
  amount?: number;
  compact?: boolean;
}

export default function DonationBadge({ amount, compact }: Props) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
        🌟
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-medium">
      🌟 {amount ? `¥${amount.toLocaleString()}寄付済み` : "寄付貢献"}
    </span>
  );
}
