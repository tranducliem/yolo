"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";
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
      case "likes": return b.likeCount - a.likeCount;
      case "posts": return b.postCount - a.postCount;
      case "best": return b.smileScore - a.smileScore || b.score - a.score;
      case "donation": return b.donationCount - a.donationCount;
      default: return b.score - a.score;
    }
  });

  const getValue = (pet: typeof mockPets[0]) => {
    switch (cat) {
      case "likes": return `${pet.likeCount.toLocaleString()} ❤️`;
      case "posts": return `${pet.postCount} 投稿`;
      case "donation": return `${pet.donationCount} 匹救済`;
      case "best": return `${pet.smileScore.toFixed(1)} ★`;
      default: return `${pet.score} pt`;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isLoggedIn ? "pb-24 md:pb-8 lg:pl-60" : "pb-20"}`}>
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-4">
        {/* Guest header */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <Link href="/" className="text-lg font-bold text-accent">🐾 YOLO</Link>
            <div className="flex items-center gap-2">
              <Link href="/signup" className="text-xs text-gray-500 hover:text-gray-700 transition-all duration-200">ログイン</Link>
              <Link href="/signup" className="px-3 py-1.5 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-xs font-bold rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">登録</Link>
            </div>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#0D1B2A] mb-4"
        >
          🔥 ランキング
        </motion.h1>

        {/* Period tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          {(["w", "m"] as const).map((p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                period === p ? "bg-accent text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
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
          className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1"
        >
          {cats.map((c) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                cat === c.id ? "bg-accent text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
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
            className="bg-emerald-50 rounded-xl p-3 mb-4 flex items-center gap-2"
          >
            <span className="text-lg">🌟</span>
            <p className="text-xs text-emerald-700 font-medium">
              写真投稿を通じて保護施設の動物を救った数でランキング
            </p>
          </motion.div>
        )}

        {/* TOP 3 medals */}
        <div className="space-y-3 mb-4">
          {sorted.slice(0, 3).map((p, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
            const bg = i === 0 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
              : i === 1 ? "bg-gradient-to-r from-gray-50 to-slate-100 border-gray-300"
              : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link href={`/pet/${p.id}`}>
                  <div className={`p-5 rounded-2xl border-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${bg}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{medal}</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-lg text-[#0D1B2A]">{p.name}</p>
                          {p.ambassadorLevel && (
                            <AmbassadorBadge level={p.ambassadorLevel} region={p.ambassadorRegion} compact />
                          )}
                        </div>
                        <p className="text-sm text-[#9CA3AF]">{p.ownerName}</p>
                        {cat === "donation" && (
                          <p className="text-[10px] text-emerald-600 mt-0.5">🌟 {p.donationCount}匹の命を救済</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent">{getValue(p)}</p>
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
          className="bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden mb-20 transition-all duration-200"
        >
          {sorted.slice(3, 20).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.03 }}
            >
              <Link href={`/pet/${p.id}`}>
                <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-50 hover:bg-gray-50 transition-all duration-200">
                  <span className="w-8 text-center text-sm font-bold text-gray-400">{i + 4}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm text-[#0D1B2A]">{p.name}</p>
                      {p.ambassadorLevel && (
                        <AmbassadorBadge level={p.ambassadorLevel} compact />
                      )}
                    </div>
                    <p className="text-sm text-[#9CA3AF]">{p.ownerName}</p>
                  </div>
                  <p className="font-bold text-accent text-sm">{getValue(p)}</p>
                  <span className={`text-xs ${p.rankChange > 0 ? "text-green-500" : p.rankChange < 0 ? "text-red-500" : "text-gray-300"}`}>
                    {p.rankChange > 0 ? `↑${p.rankChange}` : p.rankChange < 0 ? `↓${Math.abs(p.rankChange)}` : "→"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Fixed bottom bar */}
        <div className={`fixed ${isLoggedIn ? "bottom-16 md:bottom-4 lg:left-60" : "bottom-16"} left-0 right-0 z-40 px-4 pb-2`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-lg md:max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex items-center justify-between transition-all duration-200"
          >
            {isLoggedIn ? (
              <>
                <span className="text-base text-[#4B5563] font-medium">
                  あなた: <strong className="text-accent">156位</strong> / 1,234人中
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => show("Coming Soon: ブーストは準備中です")}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  🚀 ブースト ¥120
                </motion.button>
              </>
            ) : (
              <>
                <span className="text-sm text-[#4B5563]">登録するとあなたの順位が表示されます</span>
                <Link href="/signup" className="px-4 py-1.5 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-xs font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  無料で登録
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
      <BottomNav />
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="boost" />
    </div>
  );
}

export default function RankingPage() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}
