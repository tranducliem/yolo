"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

const cats = [
  { id: "total", l: "🏆総合" },
  { id: "best", l: "📸ベストショット" },
  { id: "likes", l: "❤️いいね" },
  { id: "posts", l: "📝投稿数" },
  { id: "donation", l: "🌟寄付貢献" },
];

function Inner() {
  const { isLoggedIn } = useAuth();
  const [period, setPeriod] = useState<"w" | "m">("w");
  const [cat, setCat] = useState("total");
  const [authModal, setAuthModal] = useState(false);
  const { show } = useToast();

  const sorted = [...mockPets].sort((a, b) => {
    switch (cat) {
      case "likes":
        return b.likeCount - a.likeCount;
      case "posts":
        return b.postCount - a.postCount;
      case "best":
        return b.smileScore - a.smileScore || b.score - a.score;
      case "donation":
        return b.donationCount - a.donationCount;
      default:
        return b.score - a.score;
    }
  });

  const getValue = (pet: (typeof mockPets)[0]) => {
    switch (cat) {
      case "likes":
        return `${pet.likeCount.toLocaleString()} ❤️`;
      case "posts":
        return `${pet.postCount} 投稿`;
      case "donation":
        return `${pet.donationCount} 匹救済`;
      case "best":
        return `${pet.smileScore.toFixed(1)} ★`;
      default:
        return `${pet.score} pt`;
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
          {(["w", "m"] as const).map((p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPeriod(p)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                period === p
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-gray-600 shadow-sm hover:bg-gray-100"
              }`}
            >
              {p === "w" ? "週間" : "月間"}
            </motion.button>
          ))}
        </motion.div>

        {/* Category horizontal scroll */}
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

        {/* Donation category description */}
        {cat === "donation" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3"
          >
            <span className="text-lg">🌟</span>
            <p className="text-xs font-medium text-emerald-700">
              写真投稿を通じて保護施設の動物を救った数でランキング
            </p>
          </motion.div>
        )}

        {/* TOP 3 medals */}
        <div className="mb-4 space-y-3">
          {sorted.slice(0, 3).map((p, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
            const bg =
              i === 0
                ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
                : i === 1
                  ? "bg-gradient-to-r from-gray-50 to-slate-100 border-gray-300"
                  : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link href={`/pet/${p.id}`}>
                  <div
                    className={`rounded-2xl border-2 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${bg}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{medal}</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-16 w-16 rounded-full border-2 border-white object-cover shadow"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-lg font-bold text-[#0D1B2A]">{p.name}</p>
                          {p.ambassadorLevel && (
                            <AmbassadorBadge
                              level={p.ambassadorLevel}
                              region={p.ambassadorRegion}
                              compact
                            />
                          )}
                        </div>
                        <p className="text-sm text-[#9CA3AF]">{p.ownerName}</p>
                        {cat === "donation" && (
                          <p className="mt-0.5 text-[10px] text-emerald-600">
                            🌟 {p.donationCount}匹の命を救済
                          </p>
                        )}
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

        {/* 4-20 list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-20 overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {sorted.slice(3, 20).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.03 }}
            >
              <Link href={`/pet/${p.id}`}>
                <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition-all duration-200 hover:bg-gray-50">
                  <span className="w-8 text-center text-sm font-bold text-gray-400">{i + 4}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-[#0D1B2A]">{p.name}</p>
                      {p.ambassadorLevel && <AmbassadorBadge level={p.ambassadorLevel} compact />}
                    </div>
                    <p className="text-sm text-[#9CA3AF]">{p.ownerName}</p>
                  </div>
                  <p className="text-accent text-sm font-bold">{getValue(p)}</p>
                  <span
                    className={`text-xs ${p.rankChange > 0 ? "text-green-500" : p.rankChange < 0 ? "text-red-500" : "text-gray-300"}`}
                  >
                    {p.rankChange > 0
                      ? `↑${p.rankChange}`
                      : p.rankChange < 0
                        ? `↓${Math.abs(p.rankChange)}`
                        : "→"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Fixed bottom bar */}
        <div
          className={`fixed ${isLoggedIn ? "bottom-16 md:bottom-4 lg:left-60" : "bottom-16"} right-0 left-0 z-40 px-4 pb-2`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mx-auto flex max-w-lg items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-200 md:max-w-4xl"
          >
            {isLoggedIn ? (
              <>
                <span className="text-base font-medium text-[#4B5563]">
                  あなた: <strong className="text-accent">156位</strong> / 1,234人中
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => show("Coming Soon: ブーストは準備中です")}
                  className="rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  🚀 ブースト ¥120
                </motion.button>
              </>
            ) : (
              <>
                <span className="text-sm text-[#4B5563]">登録するとあなたの順位が表示されます</span>
                <Link
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-4 py-1.5 text-xs font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
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
