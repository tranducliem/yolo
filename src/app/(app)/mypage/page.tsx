"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AMBASSADOR_RANKS } from "@/config/ambassador";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/features/auth/AuthGate";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

/* eslint-disable @next/next/no-img-element */

interface MyPet {
  id: string;
  name: string;
  type: string;
  breed: string;
  avatarUrl: string;
  isPublic: boolean;
  photos: { id: string; photoUrl: string; totalScore: number }[];
  stats: {
    postsCount: number;
    likesReceived: number;
    followersCount: number;
    followingCount: number;
    battleWins: number;
    crownCount: number;
  };
  pawPoints: number;
  ambassadorLevel: number;
}

interface Bestshot {
  id: string;
  photoUrl: string;
  totalScore: number;
  qualityScore: number;
  expressionScore: number;
  preferenceScore: number;
  aiComment: string;
  createdAt: string;
}

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
  const [myPet, setMyPet] = useState<MyPet | null>(null);
  const [bestshots, setBestshots] = useState<Bestshot[]>([]);
  const [pub, setPub] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const petRes = await fetch("/api/pets/me").then((r) => (r.ok ? r.json() : { pet: null }));
      const pet = petRes.pet;
      setMyPet(pet);
      setPub(pet?.isPublic ?? false);

      if (pet?.id) {
        const bsRes = await fetch(`/api/bestshots?petId=${pet.id}`).then((r) => r.json());
        setBestshots(bsRes.bestshots ?? []);
      }
    } catch {
      // handled via null states
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentLevel = myPet?.ambassadorLevel ?? user?.ambassadorLevel ?? 0;
  const nextRank = AMBASSADOR_RANKS[currentLevel];
  const progressPercent = currentLevel >= 5 ? 100 : Math.min(95, 40 + currentLevel * 15);
  const pawPoints = myPet?.pawPoints ?? 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        <div className="mb-4 h-32 animate-pulse rounded-2xl bg-gray-100" />
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="mb-4 h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  const petName = myPet?.name ?? user?.petName ?? "ペット";
  const petAvatar = myPet?.avatarUrl ?? myPet?.photos?.[0]?.photoUrl ?? null;
  const photos = bestshots.length > 0 ? bestshots : (myPet?.photos ?? []);

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
            {petAvatar ? (
              <img
                src={petAvatar}
                alt={petName}
                className="border-accent/20 h-20 w-20 rounded-full border-4 object-cover"
              />
            ) : (
              <div className="border-accent/20 flex h-20 w-20 items-center justify-center rounded-full border-4 bg-gray-100 text-3xl">
                🐾
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-[#0D1B2A]">{petName}</h1>
                {currentLevel > 0 && (
                  <AmbassadorBadge
                    level={currentLevel}
                    region={user?.ambassadorRegion ?? undefined}
                  />
                )}
              </div>
              <p className="text-sm text-[#9CA3AF]">
                {myPet?.breed ?? ""}{" "}
                {myPet?.type
                  ? `・${myPet.type === "dog" ? "犬" : myPet.type === "cat" ? "猫" : myPet.type}`
                  : ""}
              </p>
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
            { i: "🐾", v: `${pawPoints}pt`, l: "Paw Points" },
            { i: "❤️", v: (myPet?.stats?.likesReceived ?? 0).toLocaleString(), l: "いいね" },
            { i: "👥", v: (myPet?.stats?.followersCount ?? 0).toLocaleString(), l: "フォロワー" },
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

        {/* Donation card */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="mb-4 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#059669] p-6 text-white shadow-lg"
        >
          <div className="mb-4 text-center">
            <p className="mb-2 text-4xl">🌟</p>
            <p className="text-2xl leading-tight font-extrabold">
              あなたは
              <span className="text-3xl tabular-nums">{user?.donationCount ?? 0}</span>
              匹の命を救いました
            </p>
          </div>

          <div className="mb-4 space-y-2 rounded-xl bg-white/15 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">寄付累計</span>
              <span className="text-2xl font-extrabold tabular-nums">
                ¥{(user?.donationTotal ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Ambassador rank */}
          {currentLevel >= 1 && (
            <div className="mb-4 rounded-xl bg-white/15 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">{AMBASSADOR_RANKS[currentLevel - 1]?.emoji ?? "🌱"}</span>
                <div>
                  <p className="text-sm font-bold">
                    {AMBASSADOR_RANKS[currentLevel - 1]?.name ?? "サポーター"}
                    {user?.ambassadorRegion ? `（${user.ambassadorRegion}）` : ""}
                  </p>
                  <p className="text-[10px] text-white/70">
                    Lv.{currentLevel} / {AMBASSADOR_RANKS[currentLevel - 1]?.name}
                  </p>
                </div>
              </div>
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

        {/* Best shots grid */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.3 }}
          className="mb-4 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="mb-3 text-lg font-bold text-[#0D1B2A]">ベストショット</h2>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {photos.slice(0, 9).map((photo, i) => {
                const url = "photoUrl" in photo ? photo.photoUrl : "";
                return (
                  <motion.div
                    key={"id" in photo ? photo.id : i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className={`aspect-square overflow-hidden rounded-lg ${
                      i === 0 ? "ring-2 ring-yellow-400" : i === 1 ? "ring-2 ring-gray-300" : ""
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-3 text-4xl">📷</div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                まだベストショットがありません
              </p>
              <p className="mb-4 text-xs text-gray-400">
                AIがあなたのペットの最高の1枚を見つけます
              </p>
              <Link
                href="/try"
                className="bg-accent inline-block rounded-xl px-6 py-2.5 text-sm font-bold text-white"
              >
                撮影する →
              </Link>
            </div>
          )}
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
