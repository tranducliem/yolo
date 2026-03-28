"use client";

import type { MockPet } from "@/types";

export default function RankingCard({ pet, rank }: { pet: MockPet; rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const bg = rank === 1 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-gold"
    : rank === 2 ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300"
    : rank === 3 ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300"
    : "bg-white border-gray-100";

  if (rank <= 3) return (
    <div className={`p-4 rounded-2xl border-2 ${bg}`}>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{medal}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
        <div className="flex-1"><p className="font-bold text-lg">{pet.name}</p><p className="text-xs text-gray-500">{pet.ownerName}</p></div>
        <div className="text-right"><p className="text-2xl font-bold text-accent">{pet.score}</p><p className="text-xs text-gray-400">pt</p></div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-50">
      <span className="w-8 text-center text-sm font-bold text-gray-400">{rank}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={pet.imageUrl} alt={pet.name} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-1"><p className="font-medium text-sm">{pet.name}</p><p className="text-xs text-gray-400">{pet.ownerName}</p></div>
      <p className="font-bold text-accent text-sm">{pet.score}</p>
      <span className={`text-xs ${pet.rankChange > 0 ? "text-green-500" : pet.rankChange < 0 ? "text-red" : "text-gray-300"}`}>
        {pet.rankChange > 0 ? `↑${pet.rankChange}` : pet.rankChange < 0 ? `↓${Math.abs(pet.rankChange)}` : "→"}
      </span>
    </div>
  );
}
