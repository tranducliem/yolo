"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

/* eslint-disable @next/next/no-img-element */

type TabId = "vote" | "results";

interface BattleMatch {
  id: string;
  pet1: {
    id: string;
    name: string;
    breed: string;
    imageUrl: string;
    votes: number;
    ambassadorLevel?: number;
  };
  pet2: {
    id: string;
    name: string;
    breed: string;
    imageUrl: string;
    votes: number;
    ambassadorLevel?: number;
  };
  round: string;
}

interface RankedPet {
  rank: number;
  petId: string;
  petName: string;
  avatarUrl: string;
  ownerName: string;
  compositeScore: number;
  ambassadorLevel: number;
}

export default function BattlePage() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("vote");
  const [authModal, setAuthModal] = useState(false);
  const [battles, setBattles] = useState<BattleMatch[]>([]);
  const [top10, setTop10] = useState<RankedPet[]>([]);
  const [loading, setLoading] = useState(true);

  const [battleIndex, setBattleIndex] = useState(0);
  const [voted, setVoted] = useState<"pet1" | "pet2" | null>(null);
  const [dailyCount, setDailyCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/battle/current").then((r) => r.json()),
      fetch("/api/ranking?category=total&limit=10").then((r) => r.json()),
    ])
      .then(([battleData, rankData]) => {
        setBattles(battleData.matches ?? []);
        setTop10(rankData.rankings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentBattle = battles.length > 0 ? battles[battleIndex % battles.length] : null;
  const totalVotes = currentBattle ? currentBattle.pet1.votes + currentBattle.pet2.votes : 0;

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
    if (voted || !currentBattle) return;
    setVoted(choice);
    fetch("/api/battle/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: currentBattle.id, votedPetId: currentBattle[choice].id }),
    }).catch(() => {});
  };

  useEffect(() => {
    if (!voted) return;
    const timer = setTimeout(advanceBattle, 1500);
    return () => clearTimeout(timer);
  }, [voted, advanceBattle]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        <div className="mb-4 h-10 animate-pulse rounded bg-gray-100" />
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-100" />
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-3xl font-bold text-[#0D1B2A]">⚔️ YOLO Battle</h1>
          <p className="mb-4 text-sm text-[#9CA3AF]">今週のトーナメント</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { id: "vote" as TabId, label: "投票" },
            { id: "results" as TabId, label: "結果" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#2A9D8F] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* VOTE TAB */}
        {activeTab === "vote" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="vote">
            {!currentBattle ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="mb-3 text-4xl">⚔️</div>
                <p className="text-sm font-medium text-gray-700">
                  今週のバトルはまだ開始されていません
                </p>
                <p className="mt-1 text-xs text-gray-400">毎週月曜日に新しいバトルが始まります</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-center">
                  <span className="text-xs text-gray-500">
                    今日 <span className="font-bold text-[#2A9D8F]">{dailyCount}</span> 対決完了
                  </span>
                </div>
                <p className="mb-4 text-center text-lg font-bold text-[#0D1B2A]">
                  どっちが可愛い？
                </p>

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
                      const pct =
                        voted !== null && totalVotes > 0
                          ? Math.round((pet.votes / totalVotes) * 100)
                          : null;

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
                            <img
                              src={pet.imageUrl}
                              alt={pet.name}
                              className="h-full w-full object-cover"
                            />
                            {pet.ambassadorLevel && pet.ambassadorLevel > 0 && (
                              <div className="absolute top-2 left-2">
                                <AmbassadorBadge level={pet.ambassadorLevel} compact />
                              </div>
                            )}
                            {isWinner && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-[#2A9D8F]/10"
                              >
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-5xl"
                                >
                                  ✨
                                </motion.span>
                              </motion.div>
                            )}
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
                            <p className="text-sm font-bold text-gray-900">{pet.name}</p>
                            <p className="text-xs text-gray-400">{pet.breed}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
                <p className="text-center text-xs text-gray-400">ラウンド: {currentBattle.round}</p>
              </>
            )}
          </motion.div>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="results">
            {top10.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="mb-3 text-4xl">🏆</div>
                <p className="text-sm font-medium text-gray-700">まだ結果がありません</p>
              </div>
            ) : (
              <>
                {/* #1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 text-center shadow-sm"
                >
                  <div className="mb-2 text-4xl">👑</div>
                  {top10[0].avatarUrl ? (
                    <img
                      src={top10[0].avatarUrl}
                      alt={top10[0].petName}
                      className="mx-auto mb-3 h-24 w-24 rounded-full border-4 border-yellow-300 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-4xl">
                      🐾
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-lg font-bold text-[#0D1B2A]">{top10[0].petName}</p>
                    {top10[0].ambassadorLevel > 0 && (
                      <AmbassadorBadge level={top10[0].ambassadorLevel} compact />
                    )}
                  </div>
                  <p className="text-sm text-[#4B5563]">{top10[0].ownerName}</p>
                  <p className="mt-1 text-xl font-extrabold text-[#2A9D8F]">
                    {top10[0].compositeScore} pts
                  </p>
                </motion.div>

                {/* #2-3 */}
                {top10.length > 1 && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {top10.slice(1, 3).map((pet, i) => (
                      <motion.div
                        key={pet.petId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className={`rounded-2xl border p-4 text-center shadow-sm ${i === 0 ? "border-gray-300 bg-gray-50" : "border-orange-300 bg-orange-50"}`}
                      >
                        <div className="mb-1 text-2xl">{i === 0 ? "🥈" : "🥉"}</div>
                        {pet.avatarUrl ? (
                          <img
                            src={pet.avatarUrl}
                            alt={pet.petName}
                            className="mx-auto mb-2 h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl">
                            🐾
                          </div>
                        )}
                        <p className="text-sm font-bold">{pet.petName}</p>
                        <p className="text-xs text-gray-400">{pet.ownerName}</p>
                        <p className="mt-1 text-sm font-bold text-[#2A9D8F]">
                          {pet.compositeScore} pts
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* #4-10 */}
                {top10.length > 3 && (
                  <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
                    {top10.slice(3).map((pet, i) => (
                      <div
                        key={pet.petId}
                        className="flex items-center gap-3 border-b border-gray-50 p-3 last:border-0"
                      >
                        <span className="w-8 text-center text-sm font-bold text-gray-400">
                          #{i + 4}
                        </span>
                        {pet.avatarUrl ? (
                          <img
                            src={pet.avatarUrl}
                            alt={pet.petName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg">
                            🐾
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-bold">{pet.petName}</p>
                            {pet.ambassadorLevel > 0 && (
                              <AmbassadorBadge level={pet.ambassadorLevel} compact />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{pet.ownerName}</p>
                        </div>
                        <span className="text-sm font-bold text-[#2A9D8F]">
                          {pet.compositeScore} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Entry button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 mb-8"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!isLoggedIn) setAuthModal(true);
            }}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-base font-bold text-white shadow-lg shadow-[#2A9D8F]/20 transition-all duration-200 hover:scale-[1.02]"
          >
            🚀 エントリーする
          </motion.button>
        </motion.div>
      </div>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="default" />
    </>
  );
}
