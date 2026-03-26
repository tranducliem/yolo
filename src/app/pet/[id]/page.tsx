"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

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
  const pts = radar.map((d, i) => { const a = (Math.PI * 2 * i) / radar.length - Math.PI / 2; return { x: 100 + d.v * 80 * Math.cos(a), y: 100 + d.v * 80 * Math.sin(a) }; });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  const grid = radar.map((_, i) => { const a = (Math.PI * 2 * i) / radar.length - Math.PI / 2; return { x: 100 + 80 * Math.cos(a), y: 100 + 80 * Math.sin(a) }; });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-4">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4">← 戻る</button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-4 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pet.imageUrl} alt={pet.name} className="w-24 h-24 rounded-full object-cover border-4 border-accent/20" />
            <div><h1 className="text-2xl font-bold">{pet.name}</h1><p className="text-sm text-gray-500">{pet.breed}</p><p className="text-xs text-gray-400">{pet.ownerName}</p></div>
          </div>
          <div className="flex justify-around text-center mb-4">
            <div><p className="font-bold">{pet.postCount}</p><p className="text-xs text-gray-500">投稿</p></div>
            <div><p className="font-bold">{pet.followers}</p><p className="text-xs text-gray-500">フォロワー</p></div>
            <div><p className="font-bold">{pet.following}</p><p className="text-xs text-gray-500">フォロー</p></div>
          </div>
          <button onClick={() => { if (!isLoggedIn) { setAuthModal("follow"); return; } setFollowing(!following); }}
            className={`w-full py-2.5 rounded-xl font-bold text-sm ${following ? "bg-gray-100 text-gray-600" : "bg-accent text-white"}`}>{following ? "フォロー中" : "フォローする"}</button>
        </motion.div>

        <div className="flex bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          {([["photos", "📷 ベストショット"], ["badges", "🏆 実績"], ["stats", "📊 ステータス"]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 py-3 text-sm font-medium ${tab === k ? "text-accent border-b-2 border-accent" : "text-gray-500"}`}>{l}</button>
          ))}
        </div>

        {tab === "photos" && <div className="grid grid-cols-3 gap-1">{pet.photos.map((url, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full h-full object-cover" /></div>)}</div>}

        {tab === "badges" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            {[{ i: "👑", n: "Crown", c: pet.crownCount, d: "今日の1匹に選ばれた回数" }, { i: "⚔️", n: "Battle", c: pet.battleCount, d: "バトル参加回数" }, { i: "🎯", n: "Dare", c: pet.dareCount, d: "チャレンジ参加回数" }].map((b) => (
              <div key={b.n} className={`flex items-center gap-4 ${b.c === 0 ? "opacity-40" : ""}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${b.c > 0 ? "bg-accent/10" : "bg-gray-100"}`}>{b.i}</div>
                <div className="flex-1"><p className="font-bold">{b.n}</p><p className="text-xs text-gray-500">{b.d}</p></div>
                <p className="text-xl font-bold text-accent">{b.c}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "stats" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <svg viewBox="0 0 200 200" className="w-full max-w-[300px] mx-auto">
              {[0.25, 0.5, 0.75, 1].map((s) => {
                const p = radar.map((_, i) => { const a = (Math.PI * 2 * i) / radar.length - Math.PI / 2; return `${100 + 80 * s * Math.cos(a)},${100 + 80 * s * Math.sin(a)}`; });
                return <polygon key={s} points={p.join(" ")} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />;
              })}
              {grid.map((p, i) => <line key={i} x1="100" y1="100" x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.5" />)}
              <path d={path} fill="rgba(42,157,143,0.2)" stroke="#2A9D8F" strokeWidth="2" />
              {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2A9D8F" />)}
              {radar.map((d, i) => { const a = (Math.PI * 2 * i) / radar.length - Math.PI / 2; return <text key={i} x={100 + 95 * Math.cos(a)} y={100 + 95 * Math.sin(a)} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-gray-500">{d.label}</text>; })}
            </svg>
            <p className="mt-4 text-center text-sm text-gray-500">このペットのグッズ → <span className="text-accent font-medium">Coming Soon</span></p>
          </div>
        )}
      </div>
      <BottomNav />
      <AuthModal isOpen={!!authModal} onClose={() => setAuthModal(null)} trigger={authModal || "default"} />
    </div>
  );
}
