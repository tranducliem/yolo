"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

/* eslint-disable @next/next/no-img-element */

const cats = [
  { id: "total", l: "🏆総合" },
  { id: "likes", l: "❤️いいね" },
  { id: "posts", l: "📝投稿数" },
  { id: "followers", l: "👥フォロワー" },
  { id: "donation", l: "🌟寄付貢献" },
];

interface RankedPet {
  rank: number;
  petId: string;
  petName: string;
  avatarUrl: string;
  petType: string;
  ownerName: string;
  ambassadorLevel: number;
  postCount: number;
  totalLikes: number;
  followerCount: number;
  donationTotal: number;
  compositeScore: number;
}

function Inner() {
  const { isLoggedIn } = useAuth();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [cat, setCat] = useState("total");
  const [authModal, setAuthModal] = useState(false);
  const [rankings, setRankings] = useState<RankedPet[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ranking?category=${cat}&period=${period}&limit=20`);
      const data = await res.json();
      setRankings(data.rankings ?? []);
    } catch {
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [cat, period]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const getValue = (pet: RankedPet) => {
    switch (cat) {
      case "likes":
        return `${pet.totalLikes.toLocaleString()} ❤️`;
      case "posts":
        return `${pet.postCount} 投稿`;
      case "followers":
        return `${pet.followerCount} 人`;
      case "donation":
        return `¥${pet.donationTotal.toLocaleString()}`;
      default:
        return `${pet.compositeScore} pt`;
    }
  };

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-3xl font-bold text-[#0D1B2A]"
        >
          🔥 ランキング
        </motion.h1>

        {/* Period tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex gap-2"
        >
          {[
            { id: "weekly" as const, l: "週間" },
            { id: "monthly" as const, l: "月間" },
          ].map((p) => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPeriod(p.id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                period === p.id
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-gray-600 shadow-sm hover:bg-gray-100"
              }`}
            >
              {p.l}
            </motion.button>
          ))}
        </motion.div>

        {/* Category scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="hide-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1"
        >
          {cats.map((c) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCat(c.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                cat === c.id
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-gray-600 shadow-sm hover:bg-gray-100"
              }`}
            >
              {c.l}
            </motion.button>
          ))}
        </motion.div>

        {cat === "donation" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3"
          >
            <span className="text-lg">🌟</span>
            <p className="text-xs font-medium text-emerald-700">寄付貢献額でランキング</p>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-3 text-4xl">🏆</div>
            <p className="text-sm font-medium text-gray-700">まだランキングデータがありません</p>
            <p className="mt-1 text-xs text-gray-400">
              投稿やいいねが増えるとランキングに反映されます
            </p>
          </div>
        ) : (
          <>
            {/* TOP 3 */}
            <div className="mb-4 space-y-3">
              {rankings.slice(0, 3).map((p, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
                const bg =
                  i === 0
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
                    : i === 1
                      ? "bg-gradient-to-r from-gray-50 to-slate-100 border-gray-300"
                      : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300";
                return (
                  <motion.div
                    key={p.petId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Link href={`/pet/${p.petId}`}>
                      <div
                        className={`rounded-2xl border-2 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${bg}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{medal}</div>
                          {p.avatarUrl ? (
                            <img
                              src={p.avatarUrl}
                              alt={p.petName}
                              className="h-16 w-16 rounded-full border-2 border-white object-cover shadow"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl">
                              🐾
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-lg font-bold text-[#0D1B2A]">{p.petName}</p>
                              {p.ambassadorLevel > 0 && (
                                <AmbassadorBadge level={p.ambassadorLevel} compact />
                              )}
                            </div>
                            <p className="text-sm text-[#9CA3AF]">{p.ownerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-accent text-xl font-bold">{getValue(p)}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* 4+ list */}
            {rankings.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-20 overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {rankings.slice(3).map((p, i) => (
                  <Link key={p.petId} href={`/pet/${p.petId}`}>
                    <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition-all duration-200 hover:bg-gray-50">
                      <span className="w-8 text-center text-sm font-bold text-gray-400">
                        {i + 4}
                      </span>
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.petName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg">
                          🐾
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-[#0D1B2A]">{p.petName}</p>
                          {p.ambassadorLevel > 0 && (
                            <AmbassadorBadge level={p.ambassadorLevel} compact />
                          )}
                        </div>
                        <p className="text-sm text-[#9CA3AF]">{p.ownerName}</p>
                      </div>
                      <p className="text-accent text-sm font-bold">{getValue(p)}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* Fixed bottom bar */}
        <div
          className={`fixed ${isLoggedIn ? "bottom-16 md:bottom-4 lg:left-60" : "bottom-16"} right-0 left-0 z-40 px-4 pb-2`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mx-auto flex max-w-lg items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-lg md:max-w-4xl"
          >
            {isLoggedIn ? (
              <>
                <span className="text-base font-medium text-[#4B5563]">ランキングに参加中</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => show("Coming Soon: ブーストは準備中です")}
                  className="rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                >
                  🚀 ブースト ¥120
                </motion.button>
              </>
            ) : (
              <>
                <span className="text-sm text-[#4B5563]">登録するとあなたの順位が表示されます</span>
                <Link
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-4 py-1.5 text-xs font-bold text-white"
                >
                  無料で登録
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="boost" />
    </>
  );
}

export default function RankingPage() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}
