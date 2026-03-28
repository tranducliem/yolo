"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockBattles, mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import AuthModal from "@/components/AuthModal";
import AmbassadorBadge from "@/components/AmbassadorBadge";

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
    <div className={`min-h-screen bg-gray-50 ${isLoggedIn ? "pb-24 md:pb-8 lg:pl-60" : "pb-20"}`}>
      <SideNav />

      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-1">⚔️ YOLO Battle</h1>
          <p className="text-sm text-[#9CA3AF] mb-4">今週のトーナメント</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key="vote"
          >
            {/* Counter */}
            <div className="text-center mb-4">
              <span className="text-xs text-gray-500">
                今日 <span className="font-bold text-[#2A9D8F]">{dailyCount}/50</span> 対決完了
              </span>
            </div>

            <p className="text-center text-lg font-bold text-[#0D1B2A] mb-4">
              どっちが可愛い？
            </p>

            {/* Battle arena */}
            <AnimatePresence mode="wait">
              <motion.div
                key={battleIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-2 gap-3 mb-4"
              >
                {(["pet1", "pet2"] as const).map((side) => {
                  const pet = currentBattle[side];
                  const isWinner = voted === side;
                  const isLoser = voted !== null && voted !== side;
                  const pct =
                    voted !== null
                      ? Math.round((pet.votes / totalVotes) * 100)
                      : null;

                  return (
                    <motion.button
                      key={side}
                      whileTap={voted ? {} : { scale: 0.97 }}
                      onClick={() => handleVote(side)}
                      className={`relative rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
                        isWinner
                          ? "ring-4 ring-[#2A9D8F] shadow-lg shadow-[#2A9D8F]/20 -translate-y-1"
                          : isLoser
                          ? "opacity-60 scale-[0.98]"
                          : "hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="aspect-square relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover"
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
                            className="absolute inset-0 bg-[#2A9D8F]/10 flex items-center justify-center"
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
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-lg font-bold rounded-full"
                          >
                            {pct}%
                          </motion.div>
                        )}
                      </div>
                      <div className="bg-white p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-sm font-bold text-gray-900">
                            {pet.name}
                          </p>
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

            <p className="text-center text-xs text-gray-400">
              ラウンド: {currentBattle.round}
            </p>
          </motion.div>
        )}

        {/* ═══════════════ RESULTS TAB ═══════════════ */}
        {activeTab === "results" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key="results"
          >
            {/* #1 large card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-5 mb-4 border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="text-4xl mb-2">👑</div>
              <div className="relative inline-block mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={top10[0].imageUrl}
                  alt={top10[0].name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-300 shadow-lg"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg font-bold text-[#0D1B2A]">{top10[0].name}</p>
                {top10[0].ambassadorLevel && top10[0].ambassadorLevel > 0 && (
                  <AmbassadorBadge level={top10[0].ambassadorLevel} compact />
                )}
              </div>
              <p className="text-sm text-[#4B5563]">{top10[0].breed}</p>
              <p className="text-xl font-extrabold text-[#2A9D8F] mt-1">
                {top10[0].score} pts
              </p>
            </motion.div>

            {/* #2 and #3 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {top10.slice(1, 3).map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`rounded-2xl p-4 border text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${rankBg(i + 2)}`}
                >
                  <div className="text-2xl mb-1">{rankMedal(i + 2)}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-gray-200"
                  />
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-sm font-bold">{pet.name}</p>
                    {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                      <AmbassadorBadge level={pet.ambassadorLevel} compact />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{pet.breed}</p>
                  <p className="text-sm font-bold text-[#2A9D8F] mt-1">
                    {pet.score} pts
                  </p>
                </motion.div>
              ))}
            </div>

            {/* #4-10 list */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden mb-6">
              {top10.slice(3).map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0"
                >
                  <span className="w-8 text-center text-sm font-bold text-gray-400">
                    #{i + 4}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-10 h-10 rounded-full object-cover"
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
                  <span className="text-sm font-bold text-[#2A9D8F]">
                    {pet.score} pts
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Past winners horizontal scroll */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-sm font-bold text-[#0D1B2A] mb-3">
                🏆 過去のチャンピオン
              </h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {pastWinners.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex-shrink-0 text-center"
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400 shadow"
                      />
                      {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                        <span className="absolute -top-1 -right-1">
                          <AmbassadorBadge level={pet.ambassadorLevel} compact />
                        </span>
                      )}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">👑</span>
                    </div>
                    <p className="text-xs font-bold mt-2">{pet.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════ BRACKET TAB ═══════════════ */}
        {activeTab === "bracket" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key="bracket"
          >
            <h3 className="text-sm font-bold text-gray-700 mb-4">
              トーナメント表 (8→4→2→1)
            </h3>

            {/* Bracket visualization */}
            <div className="overflow-x-auto hide-scrollbar pb-4">
              <div className="flex gap-6 min-w-[640px] items-center">
                {/* Round 1: Quarter-finals (4 matches) */}
                <div className="flex flex-col gap-6 flex-shrink-0">
                  <p className="text-xs font-bold text-gray-400 text-center mb-1">準々決勝</p>
                  {mockBattles.slice(4, 8).map((b) => (
                    <BracketMatch key={b.id} battle={b} />
                  ))}
                </div>

                {/* Connector */}
                <div className="flex flex-col gap-[88px] flex-shrink-0 items-center justify-center">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-6 h-px bg-gray-300" />
                  ))}
                </div>

                {/* Round 2: Semi-finals (2 matches) */}
                <div className="flex flex-col gap-12 flex-shrink-0">
                  <p className="text-xs font-bold text-gray-400 text-center mb-1">準決勝</p>
                  {mockBattles.slice(2, 4).map((b) => (
                    <BracketMatch key={b.id} battle={b} />
                  ))}
                </div>

                {/* Connector */}
                <div className="flex flex-col gap-[140px] flex-shrink-0 items-center justify-center">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="w-6 h-px bg-gray-300" />
                  ))}
                </div>

                {/* Round 3: Finals (1 match) */}
                <div className="flex flex-col flex-shrink-0">
                  <p className="text-xs font-bold text-gray-400 text-center mb-1">決勝</p>
                  {mockBattles.slice(0, 1).map((b) => (
                    <BracketMatch key={b.id} battle={b} isFinal />
                  ))}
                </div>

                {/* Winner */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <p className="text-xs font-bold text-yellow-500 text-center mb-1">優勝</p>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-3 text-center">
                    <span className="text-2xl">🏆</span>
                    <p className="text-xs font-bold mt-1">?</p>
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
          className="bg-white rounded-2xl shadow-sm p-5 mt-6 mb-4 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={myPet.imageUrl}
              alt={myPet.name}
              className="w-12 h-12 rounded-full object-cover"
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
            <div className="bg-gray-50 rounded-xl p-2 hover:shadow-sm transition-all duration-200">
              <p className="text-xs text-[#9CA3AF]">勝率</p>
              <p className="text-sm font-bold text-[#2A9D8F]">72%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 hover:shadow-sm transition-all duration-200">
              <p className="text-xs text-[#9CA3AF]">戦績</p>
              <p className="text-sm font-bold text-[#0D1B2A]">18勝7敗</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 hover:shadow-sm transition-all duration-200">
              <p className="text-xs text-[#9CA3AF]">最高順位</p>
              <p className="text-sm font-bold text-yellow-500">#3</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 hover:shadow-sm transition-all duration-200">
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
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-base font-bold shadow-lg shadow-[#2A9D8F]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            🚀 エントリーする
          </motion.button>
        </motion.div>
      </div>

      <BottomNav />
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        trigger="default"
      />
    </div>
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
      className={`rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
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
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-xs font-medium truncate flex-1">
              {pet.name}
            </span>
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
