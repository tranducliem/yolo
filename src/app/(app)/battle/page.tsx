"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockBattles, mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

type TabId = "vote" | "results" | "bracket";

const tabs: { id: TabId; label: string }[] = [
  { id: "vote", label: "投票" },
  { id: "results", label: "結果" },
  { id: "bracket", label: "トーナメント表" },
];

/* ── Medal helpers ── */
function rankMedal(rank: number): string {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function rankBg(rank: number): string {
  if (rank === 1) return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300";
  if (rank === 2) return "bg-gray-50 border-gray-300";
  if (rank === 3) return "bg-orange-50 border-orange-300";
  return "bg-white border-gray-200";
}

/* ── Past winners (mock from top scoring pets) ── */
const pastWinners = mockPets.slice(0, 6);

export default function BattlePage() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("vote");
  const [authModal, setAuthModal] = useState(false);

  /* ── Vote tab state ── */
  const [battleIndex, setBattleIndex] = useState(0);
  const [voted, setVoted] = useState<"pet1" | "pet2" | null>(null);
  const [dailyCount, setDailyCount] = useState(3);
  const currentBattle = mockBattles[battleIndex % mockBattles.length];
  const totalVotes = currentBattle.pet1.votes + currentBattle.pet2.votes;

  const advanceBattle = useCallback(() => {
    setVoted(null);
    setBattleIndex((prev) => prev + 1);
    setDailyCount((prev) => prev + 1);
  }, []);

  const handleVote = (choice: "pet1" | "pet2") => {
    if (!isLoggedIn) {
      setAuthModal(true);
      return;
    }
    if (voted) return;
    setVoted(choice);
  };

  useEffect(() => {
    if (!voted) return;
    const timer = setTimeout(advanceBattle, 1500);
    return () => clearTimeout(timer);
  }, [voted, advanceBattle]);

  /* ── Results tab: TOP 10 ── */
  const top10 = [...mockPets].sort((a, b) => b.score - a.score).slice(0, 10);

  /* ── My pet stats ── */
  const myPet = mockPets[0];

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-3xl font-bold text-[#0D1B2A]">⚔️ YOLO Battle</h1>
          <p className="mb-4 text-sm text-[#9CA3AF]">今週のトーナメント</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-2"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#2A9D8F] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ═══════════════ VOTE TAB ═══════════════ */}
        {activeTab === "vote" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="vote">
            {/* Counter */}
            <div className="mb-4 text-center">
              <span className="text-xs text-gray-500">
                今日 <span className="font-bold text-[#2A9D8F]">{dailyCount}/50</span> 対決完了
              </span>
            </div>

            <p className="mb-4 text-center text-lg font-bold text-[#0D1B2A]">どっちが可愛い？</p>

            {/* Battle arena */}
            <AnimatePresence mode="wait">
              <motion.div
                key={battleIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 grid grid-cols-2 gap-3"
              >
                {(["pet1", "pet2"] as const).map((side) => {
                  const pet = currentBattle[side];
                  const isWinner = voted === side;
                  const isLoser = voted !== null && voted !== side;
                  const pct = voted !== null ? Math.round((pet.votes / totalVotes) * 100) : null;

                  return (
                    <motion.button
                      key={side}
                      whileTap={voted ? {} : { scale: 0.97 }}
                      onClick={() => handleVote(side)}
                      className={`relative overflow-hidden rounded-2xl shadow-sm transition-all duration-200 ${
                        isWinner
                          ? "-translate-y-1 shadow-lg ring-4 shadow-[#2A9D8F]/20 ring-[#2A9D8F]"
                          : isLoser
                            ? "scale-[0.98] opacity-60"
                            : "hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                    >
                      <div className="relative aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="h-full w-full object-cover"
                        />
                        {/* Ambassador badge overlay */}
                        {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                          <div className="absolute top-2 left-2">
                            <AmbassadorBadge level={pet.ambassadorLevel} compact />
                          </div>
                        )}
                        {/* Winner sparkle overlay */}
                        {isWinner && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-[#2A9D8F]/10"
                          >
                            <motion.span
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="text-5xl"
                            >
                              ✨
                            </motion.span>
                          </motion.div>
                        )}
                        {/* Vote percentage */}
                        {pct !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-lg font-bold text-white"
                          >
                            {pct}%
                          </motion.div>
                        )}
                      </div>
                      <div className="bg-white p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-sm font-bold text-gray-900">{pet.name}</p>
                          {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                            <AmbassadorBadge level={pet.ambassadorLevel} compact />
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{pet.breed}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <p className="text-center text-xs text-gray-400">ラウンド: {currentBattle.round}</p>
          </motion.div>
        )}

        {/* ═══════════════ RESULTS TAB ═══════════════ */}
        {activeTab === "results" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="results">
            {/* #1 large card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 text-center shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="mb-2 text-4xl">👑</div>
              <div className="relative mb-3 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={top10[0].imageUrl}
                  alt={top10[0].name}
                  className="h-24 w-24 rounded-full border-4 border-yellow-300 object-cover shadow-lg"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg font-bold text-[#0D1B2A]">{top10[0].name}</p>
                {top10[0].ambassadorLevel && top10[0].ambassadorLevel > 0 && (
                  <AmbassadorBadge level={top10[0].ambassadorLevel} compact />
                )}
              </div>
              <p className="text-sm text-[#4B5563]">{top10[0].breed}</p>
              <p className="mt-1 text-xl font-extrabold text-[#2A9D8F]">{top10[0].score} pts</p>
            </motion.div>

            {/* #2 and #3 */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              {top10.slice(1, 3).map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`rounded-2xl border p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${rankBg(i + 2)}`}
                >
                  <div className="mb-1 text-2xl">{rankMedal(i + 2)}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="mx-auto mb-2 h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                  />
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-sm font-bold">{pet.name}</p>
                    {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                      <AmbassadorBadge level={pet.ambassadorLevel} compact />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{pet.breed}</p>
                  <p className="mt-1 text-sm font-bold text-[#2A9D8F]">{pet.score} pts</p>
                </motion.div>
              ))}
            </div>

            {/* #4-10 list */}
            <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              {top10.slice(3).map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  className="flex items-center gap-3 border-b border-gray-50 p-3 last:border-0"
                >
                  <span className="w-8 text-center text-sm font-bold text-gray-400">#{i + 4}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold">{pet.name}</p>
                      {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                        <AmbassadorBadge level={pet.ambassadorLevel} compact />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{pet.breed}</p>
                  </div>
                  <span className="text-sm font-bold text-[#2A9D8F]">{pet.score} pts</span>
                </motion.div>
              ))}
            </div>

            {/* Past winners horizontal scroll */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="mb-3 text-sm font-bold text-[#0D1B2A]">🏆 過去のチャンピオン</h3>
              <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
                {pastWinners.map((pet) => (
                  <div key={pet.id} className="flex-shrink-0 text-center">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="h-16 w-16 rounded-full border-2 border-yellow-400 object-cover shadow"
                      />
                      {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                        <span className="absolute -top-1 -right-1">
                          <AmbassadorBadge level={pet.ambassadorLevel} compact />
                        </span>
                      )}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">
                        👑
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold">{pet.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════ BRACKET TAB ═══════════════ */}
        {activeTab === "bracket" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="bracket">
            <h3 className="mb-4 text-sm font-bold text-gray-700">トーナメント表 (8→4→2→1)</h3>

            {/* Bracket visualization */}
            <div className="hide-scrollbar overflow-x-auto pb-4">
              <div className="flex min-w-[640px] items-center gap-6">
                {/* Round 1: Quarter-finals (4 matches) */}
                <div className="flex flex-shrink-0 flex-col gap-6">
                  <p className="mb-1 text-center text-xs font-bold text-gray-400">準々決勝</p>
                  {mockBattles.slice(4, 8).map((b) => (
                    <BracketMatch key={b.id} battle={b} />
                  ))}
                </div>

                {/* Connector */}
                <div className="flex flex-shrink-0 flex-col items-center justify-center gap-[88px]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-px w-6 bg-gray-300" />
                  ))}
                </div>

                {/* Round 2: Semi-finals (2 matches) */}
                <div className="flex flex-shrink-0 flex-col gap-12">
                  <p className="mb-1 text-center text-xs font-bold text-gray-400">準決勝</p>
                  {mockBattles.slice(2, 4).map((b) => (
                    <BracketMatch key={b.id} battle={b} />
                  ))}
                </div>

                {/* Connector */}
                <div className="flex flex-shrink-0 flex-col items-center justify-center gap-[140px]">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-px w-6 bg-gray-300" />
                  ))}
                </div>

                {/* Round 3: Finals (1 match) */}
                <div className="flex flex-shrink-0 flex-col">
                  <p className="mb-1 text-center text-xs font-bold text-gray-400">決勝</p>
                  {mockBattles.slice(0, 1).map((b) => (
                    <BracketMatch key={b.id} battle={b} isFinal />
                  ))}
                </div>

                {/* Winner */}
                <div className="flex flex-shrink-0 flex-col items-center">
                  <p className="mb-1 text-center text-xs font-bold text-yellow-500">優勝</p>
                  <div className="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 p-3 text-center">
                    <span className="text-2xl">🏆</span>
                    <p className="mt-1 text-xs font-bold">?</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── My pet stats card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 mb-4 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div className="mb-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={myPet.imageUrl}
              alt={myPet.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold">{myPet.name}の戦績</p>
                {myPet.ambassadorLevel && myPet.ambassadorLevel > 0 && (
                  <AmbassadorBadge level={myPet.ambassadorLevel} compact />
                )}
              </div>
              <p className="text-xs text-gray-400">{myPet.breed}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-xl bg-gray-50 p-2 transition-all duration-200 hover:shadow-sm">
              <p className="text-xs text-[#9CA3AF]">勝率</p>
              <p className="text-sm font-bold text-[#2A9D8F]">72%</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2 transition-all duration-200 hover:shadow-sm">
              <p className="text-xs text-[#9CA3AF]">戦績</p>
              <p className="text-sm font-bold text-[#0D1B2A]">18勝7敗</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2 transition-all duration-200 hover:shadow-sm">
              <p className="text-xs text-[#9CA3AF]">最高順位</p>
              <p className="text-sm font-bold text-yellow-500">#3</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2 transition-all duration-200 hover:shadow-sm">
              <p className="text-xs text-[#9CA3AF]">現在ラウンド</p>
              <p className="text-sm font-bold text-[#0D1B2A]">準決勝</p>
            </div>
          </div>
        </motion.div>

        {/* Entry button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!isLoggedIn) {
                setAuthModal(true);
                return;
              }
            }}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-base font-bold text-white shadow-lg shadow-[#2A9D8F]/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            🚀 エントリーする
          </motion.button>
        </motion.div>
      </div>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="default" />
    </>
  );
}

/* ── Bracket match component ── */
function BracketMatch({
  battle,
  isFinal = false,
}: {
  battle: (typeof mockBattles)[number];
  isFinal?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${
        isFinal ? "border-[#2A9D8F] bg-[#2A9D8F]/5" : "border-gray-200 bg-white"
      }`}
    >
      {(["pet1", "pet2"] as const).map((side, si) => {
        const pet = battle[side];
        return (
          <div
            key={side}
            className={`flex items-center gap-2 px-3 py-2 ${
              si === 0 ? "border-b border-gray-100" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pet.imageUrl}
              alt={pet.name}
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
            />
            <span className="flex-1 truncate text-xs font-medium">{pet.name}</span>
            {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
              <AmbassadorBadge level={pet.ambassadorLevel} compact />
            )}
            <span className="text-[10px] text-gray-400">{pet.votes}</span>
          </div>
        );
      })}
    </div>
  );
}
