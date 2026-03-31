"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { mockPets, ambassadorRanks } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/features/auth/AuthGate";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

const me = mockPets[0];

export default function MyPage() {
  return (
    <AuthGate>
      <MyPageInner />
    </AuthGate>
  );
}

function MyPageInner() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pub, setPub] = useState(false);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Ambassador progress
  const currentLevel = user?.ambassadorLevel ?? 0;
  const nextRank = ambassadorRanks[currentLevel]; // next rank (0-indexed: level 3 -> index 3 is level 4)
  const progressPercent = currentLevel >= 5 ? 100 : Math.min(95, 40 + currentLevel * 15);

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        {/* Profile card */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0 }}
          className="mb-4 rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={me.imageUrl}
              alt={me.name}
              className="border-accent/20 h-20 w-20 rounded-full border-4 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-[#0D1B2A]">{user?.petName || me.name}</h1>
                {user?.ambassadorLevel && (
                  <AmbassadorBadge
                    level={user.ambassadorLevel}
                    region={user.ambassadorRegion ?? undefined}
                  />
                )}
              </div>
              <p className="text-sm text-[#9CA3AF]">YOLOを始めて3日目</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">タイムラインに公開</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setPub(!pub)}
              className={`relative h-7 w-12 rounded-full transition-colors ${pub ? "bg-accent" : "bg-gray-300"}`}
            >
              <motion.div
                animate={{ left: pub ? 26 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="mb-4 grid grid-cols-3 gap-3">
          {[
            {
              i: "🐾",
              v: `${user?.donationTotal ? Math.floor(user.donationTotal / 10) : 50}pt`,
              l: "Paw Points",
            },
            { i: "❤️", v: me.likeCount.toLocaleString(), l: "いいね" },
            { i: "👥", v: me.followers.toLocaleString(), l: "フォロワー" },
          ].map((s) => (
            <motion.div
              key={s.l}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl bg-white p-4 text-center shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#2A9D8F]/10">
                <span className="text-xl">{s.i}</span>
              </div>
              <div className="text-xl font-bold text-[#0D1B2A] tabular-nums">{s.v}</div>
              <div className="text-xs text-[#9CA3AF]">{s.l}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Donation card - LARGE teal gradient */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="mb-4 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#059669] p-6 text-white shadow-lg"
        >
          <div className="mb-4 text-center">
            <p className="mb-2 text-4xl">🌟</p>
            <p className="text-2xl leading-tight font-extrabold">
              あなたは<span className="text-3xl tabular-nums">{user?.donationCount ?? 47}</span>
              匹の命を救いました
            </p>
          </div>

          <div className="mb-4 space-y-2 rounded-xl bg-white/15 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">寄付累計</span>
              <span className="text-2xl font-extrabold tabular-nums">
                ¥{(user?.donationTotal ?? 2340).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">今月</span>
              <span className="font-bold">
                ¥148<span className="ml-1 text-xs text-white/60">（PRO会員費から¥148）</span>
              </span>
            </div>
          </div>

          {/* Ambassador rank */}
          {user?.ambassadorLevel && user.ambassadorLevel >= 1 && (
            <div className="mb-4 rounded-xl bg-white/15 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <p className="text-sm font-bold">
                    地域アンバサダー{user.ambassadorRegion ? `（${user.ambassadorRegion}）` : ""}
                  </p>
                  <p className="text-[10px] text-white/70">
                    Lv.{user.ambassadorLevel} /{" "}
                    {ambassadorRanks[(user.ambassadorLevel || 1) - 1]?.name}
                  </p>
                </div>
              </div>
              {/* Progress bar to next rank */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/70">
                  <span>現在: Lv.{currentLevel}</span>
                  <span>
                    {currentLevel >= 5
                      ? "MAX"
                      : `次: Lv.${currentLevel + 1} ${nextRank?.name ?? ""}`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-2 rounded-full bg-yellow-300"
                  />
                </div>
              </div>
            </div>
          )}

          <Link href="/donation">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-white/20 py-3 text-center text-sm font-bold transition-colors hover:bg-white/30"
            >
              詳しく見る →
            </motion.div>
          </Link>
        </motion.div>

        {/* Best shots 3-col 9 photos */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.3 }}
          className="mb-4 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="mb-3 text-lg font-bold text-[#0D1B2A]">今月のベストショット</h2>
          <div className="grid grid-cols-3 gap-1">
            {me.photos.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`aspect-square overflow-hidden rounded-lg ${
                  i === 0 ? "ring-2 ring-yellow-400" : i === 1 ? "ring-2 ring-gray-300" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons grid */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="mb-4 grid grid-cols-2 gap-3">
          {[
            { i: "📖", l: "Book", h: "/book" },
            { i: "✨", l: "Studio", h: "/studio" },
            { i: "🎁", l: "Goods", h: "/goods" },
            { i: "📦", l: "注文履歴", h: "/orders" },
            { i: "⚙️", l: "設定", h: "/settings" },
            { i: "💎", l: "プラン", h: "/subscription" },
            { i: "🌟", l: "寄付", h: "/donation" },
            { i: "👑", l: "アンバサダー", h: "/ambassador" },
          ].map((a) => (
            <motion.button
              key={a.l}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(a.h)}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2A9D8F]/10">
                <span className="text-xl">{a.i}</span>
              </div>
              <div className="text-left text-sm leading-tight font-medium text-[#4B5563]">
                {a.l}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="mt-6 mb-4 text-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="text-sm font-medium text-red-500 transition-all duration-200 hover:text-red-600"
          >
            ログアウト
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
