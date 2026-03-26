"use client";

import { useState } from "react";
import Link from "next/link";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import RankingCard from "@/components/RankingCard";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import { ToastProvider, useToast } from "@/components/Toast";

const cats = [
  { id: "total", l: "🏆 総合" }, { id: "best", l: "📸 ベストショット" },
  { id: "likes", l: "❤️ いいね" }, { id: "posts", l: "📝 投稿数" },
  { id: "comments", l: "💬 コメント" }, { id: "shares", l: "🔄 シェア" },
];

function Inner() {
  const { isLoggedIn } = useAuth();
  const [period, setPeriod] = useState<"w" | "m">("w");
  const [cat, setCat] = useState("total");
  const [authModal, setAuthModal] = useState(false);
  const { show } = useToast();
  const sorted = [...mockPets].sort((a, b) => b.score - a.score);

  return (
    <div className={`min-h-screen bg-gray-50 ${isLoggedIn ? "pb-24 lg:pb-8 lg:pl-60" : "pb-20"}`}>
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-4">
        {/* Guest header */}
        {!isLoggedIn && (
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-lg font-bold text-accent">🐾 tomoni</Link>
            <div className="flex items-center gap-2">
              <Link href="/signup" className="text-xs text-gray-500">ログイン</Link>
              <Link href="/signup" className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg">登録</Link>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4">🔥 ランキング</h1>
        <div className="flex gap-2 mb-4">
          {(["w", "m"] as const).map((p) => <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-xl text-sm font-bold ${period === p ? "bg-accent text-white" : "bg-white text-gray-600"}`}>{p === "w" ? "週間" : "月間"}</button>)}
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1">
          {cats.map((c) => <button key={c.id} onClick={() => setCat(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${cat === c.id ? "bg-accent text-white" : "bg-white text-gray-600"}`}>{c.l}</button>)}
        </div>
        <div className="space-y-3 mb-4">{sorted.slice(0, 3).map((p, i) => <RankingCard key={p.id} pet={p} rank={i + 1} />)}</div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-20">{sorted.slice(3, 20).map((p, i) => <RankingCard key={p.id} pet={p} rank={i + 4} />)}</div>

        {/* Fixed bottom */}
        <div className={`fixed ${isLoggedIn ? "bottom-16 lg:bottom-4 lg:left-60" : "bottom-16"} left-0 right-0 z-40 px-4 pb-2`}>
          <div className="max-w-lg md:max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex items-center justify-between">
            {isLoggedIn ? (
              <>
                <span className="text-sm font-medium">あなたの順位: <strong className="text-accent">156位</strong> / 1,234人中</span>
                <button onClick={() => show("Coming Soon! お楽しみに 🚀")} className="px-3 py-1.5 bg-gradient-to-r from-accent to-accent-light text-white text-xs font-bold rounded-xl">🚀 ブースト ¥120</button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600">登録するとあなたの順位が表示されます</span>
                <Link href="/signup" className="px-4 py-1.5 bg-accent text-white text-xs font-bold rounded-xl">無料で登録</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="boost" />
    </div>
  );
}

export default function RankingPage() { return <ToastProvider><Inner /></ToastProvider>; }
