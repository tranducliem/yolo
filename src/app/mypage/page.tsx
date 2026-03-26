"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

const me = mockPets[0];

export default function MyPage() {
  return <AuthGate><MyPageInner /></AuthGate>;
}

function MyPageInner() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pub, setPub] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-4 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={me.imageUrl} alt={me.name} className="w-20 h-20 rounded-full object-cover border-4 border-accent/20" />
            <div><h1 className="text-2xl font-bold">{me.name}</h1><p className="text-gray-500 text-sm">tomoniを始めて3日目 🎉</p></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">タイムラインに公開</span>
            <button onClick={() => setPub(!pub)} className={`w-12 h-7 rounded-full relative transition-colors ${pub ? "bg-accent" : "bg-gray-300"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-all ${pub ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ i: "🐾", v: "50", l: "Paw Points" }, { i: "❤️", v: "12", l: "いいね" }, { i: "👥", v: "3", l: "フォロワー" }].map((s) => (
            <div key={s.l} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">{s.i}</div><div className="text-xl font-bold">{s.v}</div><div className="text-xs text-gray-500">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Best shots */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="font-bold mb-3">今月のベストショット</h2>
          <div className="grid grid-cols-3 gap-1">
            {me.photos.map((url, i) => (
              <div key={i} className={`aspect-square rounded-lg overflow-hidden ${i === 0 ? "ring-2 ring-gold" : i === 1 ? "ring-2 ring-gray-300" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Donation */}
        <div className="bg-accent rounded-2xl p-5 shadow-sm mb-4 text-white text-center">
          <p className="text-3xl mb-2">🌟</p>
          <p className="font-bold text-lg">あなたは2匹の命を救いました</p>
          <p className="text-white/80 text-sm mt-1">寄付累計 ¥240</p>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="font-bold mb-3">実績バッジ</h2>
          <div className="flex gap-4 justify-center">
            {[{ i: "👑", n: "Crown", ok: false }, { i: "⚔️", n: "Battle", ok: false }, { i: "🎯", n: "Dare", ok: true }].map((b) => (
              <div key={b.n} className={`text-center ${b.ok ? "" : "opacity-40 grayscale"}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${b.ok ? "bg-accent/10" : "bg-gray-100"}`}>{b.i}</div>
                <p className="text-xs mt-1 font-medium">{b.n}</p>
                {!b.ok && <p className="text-[10px] text-gray-400">参加すると解放！</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ i: "📖", l: "フォトブック", h: "/book" }, { i: "✨", l: "イラスト化", h: "/studio" }, { i: "🎁", l: "グッズ", h: "/goods" }].map((a) => (
            <motion.button key={a.l} whileTap={{ scale: 0.95 }} onClick={() => router.push(a.h)} className="bg-white rounded-2xl p-4 shadow-sm text-center hover:bg-gray-50">
              <div className="text-2xl mb-1">{a.i}</div><div className="text-xs font-medium text-gray-600">{a.l}</div>
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <div className="text-center mt-6 mb-4">
          <button onClick={logout} className="text-sm text-gray-400 hover:text-red">ログアウト</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
