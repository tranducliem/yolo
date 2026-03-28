"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

type Tab = "photos" | "badges" | "stats";

export default function PetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>("photos");
  const [following, setFollowing] = useState(false);
  const [authModal, setAuthModal] = useState<string | null>(null);
  const pet = mockPets.find((p) => p.id === id) || mockPets[0];

  const radar = [
    { label: "笑顔度", v: pet.smileScore / 5 },
    { label: "愛情度", v: pet.loveScore / 5 },
    { label: "レア度", v: pet.rareScore / 5 },
    { label: "人気度", v: Math.min(pet.followers / 5000, 1) },
    { label: "活動度", v: Math.min(pet.postCount / 50, 1) },
  ];
  const pts = radar.map((d, i) => {
    const a = (Math.PI * 2 * i) / radar.length - Math.PI / 2;
    return {
      x: 100 + d.v * 80 * Math.cos(a),
      y: 100 + d.v * 80 * Math.sin(a),
    };
  });
  const path =
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  const grid = radar.map((_, i) => {
    const a = (Math.PI * 2 * i) / radar.length - Math.PI / 2;
    return { x: 100 + 80 * Math.cos(a), y: 100 + 80 * Math.sin(a) };
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-4">
        {/* Back + pet name header */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <button
            onClick={() => router.back()}
            className="text-sm text-[#9CA3AF] hover:text-[#4B5563] transition-all duration-200"
          >
            ← 戻る
          </button>
          <span className="text-sm font-medium text-gray-700">{pet.name}</span>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 mb-4"
        >
          <div className="flex flex-col items-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pet.imageUrl}
              alt={pet.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-accent/20 mb-3"
            />
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-[#0D1B2A]">{pet.name}</h1>
              {pet.ambassadorLevel && (
                <AmbassadorBadge level={pet.ambassadorLevel} region={pet.ambassadorRegion} />
              )}
            </div>
            <p className="text-base text-[#4B5563]">
              {pet.species === "dog" ? "🐶" : "🐱"} {pet.breed}
            </p>
            <p className="text-sm text-[#9CA3AF]">{pet.ownerName}</p>
          </div>

          {/* Donation contribution message */}
          {pet.donationCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-emerald-50 rounded-xl p-3 mb-4 text-center"
            >
              <p className="text-sm text-emerald-700 font-medium">
                🌟 この子の写真で{pet.donationCount}匹が救われました
              </p>
            </motion.div>
          )}

          {/* Stats row */}
          <div className="flex justify-around text-center mb-4">
            {[
              { v: pet.postCount, l: "投稿" },
              { v: pet.followers.toLocaleString(), l: "フォロワー" },
              { v: pet.following, l: "フォロー" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-bold text-[#0D1B2A]">{s.v}</p>
                <p className="text-sm text-[#9CA3AF]">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Follow button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!isLoggedIn) {
                setAuthModal("follow");
                return;
              }
              setFollowing(!following);
            }}
            className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-200 ${
              following
                ? "bg-white border-2 border-[#2A9D8F] text-[#2A9D8F] hover:bg-[#F0FDFB]"
                : "bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {following ? "フォロー中" : "フォローする"}
          </motion.button>
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex bg-white rounded-2xl shadow-sm mb-4 overflow-hidden hover:shadow-md transition-all duration-200"
        >
          {([
            ["photos", "📷 ベストショット"],
            ["badges", "🏆 実績"],
            ["stats", "📊 ステータス"],
          ] as [Tab, string][]).map(([k, l]) => (
            <motion.button
              key={k}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab(k)}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${
                tab === k
                  ? "text-accent border-b-2 border-accent"
                  : "text-[#9CA3AF] hover:text-[#4B5563]"
              }`}
            >
              {l}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* Photos tab */}
          {tab === "photos" && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-1"
            >
              {pet.photos.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Badges tab */}
          {tab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
            >
              {[
                {
                  i: "👑",
                  n: "Crown",
                  c: pet.crownCount,
                  d: "今日の1匹に選ばれた回数",
                },
                {
                  i: "⚔️",
                  n: "Battle",
                  c: pet.battleCount,
                  d: "バトル参加回数",
                },
                {
                  i: "🎯",
                  n: "Dare",
                  c: pet.dareCount,
                  d: "チャレンジ参加回数",
                },
                {
                  i: "🌟",
                  n: "寄付貢献",
                  c: pet.donationCount,
                  d: "写真を通じて救った動物の数",
                },
              ].map((b, idx) => (
                <motion.div
                  key={b.n}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-4 ${
                    b.c === 0 ? "opacity-40" : ""
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                      b.c > 0 ? "bg-accent/10" : "bg-gray-100"
                    }`}
                  >
                    {b.i}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{b.n}</p>
                    <p className="text-xs text-gray-500">{b.d}</p>
                  </div>
                  <p className="text-xl font-bold text-accent">{b.c}</p>
                </motion.div>
              ))}

              {/* Ambassador badge section */}
              {pet.ambassadorLevel && pet.ambassadorLevel >= 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-gray-100 pt-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-amber-50">
                    👑
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">アンバサダー</p>
                      <AmbassadorBadge level={pet.ambassadorLevel} region={pet.ambassadorRegion} />
                    </div>
                    <p className="text-xs text-gray-500">Lv.{pet.ambassadorLevel}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Stats tab - Radar chart */}
          {tab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg viewBox="0 0 200 200" className="w-full max-w-[300px] mx-auto">
                {/* Grid polygons */}
                {[0.25, 0.5, 0.75, 1].map((s) => {
                  const p = radar.map((_, i) => {
                    const a =
                      (Math.PI * 2 * i) / radar.length - Math.PI / 2;
                    return `${100 + 80 * s * Math.cos(a)},${
                      100 + 80 * s * Math.sin(a)
                    }`;
                  });
                  return (
                    <polygon
                      key={s}
                      points={p.join(" ")}
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  );
                })}
                {/* Grid lines */}
                {grid.map((p, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1="100"
                    x2={p.x}
                    y2={p.y}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Data polygon */}
                <motion.path
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  d={path}
                  fill="rgba(42,157,143,0.2)"
                  stroke="#2A9D8F"
                  strokeWidth="2"
                  style={{ transformOrigin: "100px 100px" }}
                />
                {/* Data points */}
                {pts.map((p, i) => (
                  <motion.circle
                    key={i}
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ opacity: 1, r: 4 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    cx={p.x}
                    cy={p.y}
                    fill="#2A9D8F"
                  />
                ))}
                {/* Labels */}
                {radar.map((d, i) => {
                  const a =
                    (Math.PI * 2 * i) / radar.length - Math.PI / 2;
                  return (
                    <text
                      key={i}
                      x={100 + 95 * Math.cos(a)}
                      y={100 + 95 * Math.sin(a)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[8px] fill-gray-500"
                    >
                      {d.label}
                    </text>
                  );
                })}
              </svg>

              {/* Stats summary below radar */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center hover:shadow-sm transition-all duration-200">
                  <p className="text-sm text-[#9CA3AF]">総合スコア</p>
                  <p className="text-lg font-bold text-accent">{pet.score}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center hover:shadow-sm transition-all duration-200">
                  <p className="text-sm text-[#9CA3AF]">Paw Points</p>
                  <p className="text-lg font-bold text-accent">{pet.pawPoints}</p>
                </div>
              </div>

              {/* Donation contribution in stats */}
              {pet.donationCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 bg-emerald-50 rounded-xl p-3 text-center"
                >
                  <p className="text-xs text-emerald-600 font-medium">
                    🌟 寄付貢献: {pet.donationCount}匹救済
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
      <AuthModal
        isOpen={!!authModal}
        onClose={() => setAuthModal(null)}
        trigger={authModal || "default"}
      />
    </div>
  );
}
