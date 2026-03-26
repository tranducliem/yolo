"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { mockPosts, exploreCategories } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import EmotionButtons from "@/components/EmotionButtons";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

type Mode = "grid" | "feed";

export default function ExplorePage() {
  const { isLoggedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("recommend");
  const [mode, setMode] = useState<Mode>("grid");
  const [modal, setModal] = useState<(typeof mockPosts)[0] | null>(null);
  const [fi, setFi] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("explore_banner_dismissed") === "true";
    return false;
  });
  const [authTrigger, setAuthTrigger] = useState<string | null>(null);
  const posts = mockPosts;

  const dismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem("explore_banner_dismissed", "true");
  };

  const authAction = (trigger: string) => {
    if (!isLoggedIn) { setAuthTrigger(trigger); return; }
  };

  // Insert promo cards in feed mode after every 5 posts starting at index 10
  const isPromoIndex = (i: number) => !isLoggedIn && i >= 10 && (i - 10) % 5 === 0;

  return (
    <div className={`min-h-screen bg-gray-50 ${isLoggedIn ? "pb-24 lg:pb-8 lg:pl-60" : "pb-20"}`}>
      <SideNav />
      <div className="max-w-lg md:max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 py-4 sticky top-0 bg-gray-50 z-40">
          {!isLoggedIn && <Link href="/" className="text-lg font-bold text-accent flex-shrink-0">🐾</Link>}
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ペット名・タグで検索" className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
          {!isLoggedIn ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/signup" className="text-xs text-gray-500">ログイン</Link>
              <Link href="/signup" className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg">登録</Link>
            </div>
          ) : (
            <button className="text-2xl">🔔</button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sticky top-14 bg-gray-50 z-30 mb-3">
          {exploreCategories.map((c) => <button key={c.id} onClick={() => setCat(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${cat === c.id ? "bg-accent text-white" : "bg-white text-gray-600"}`}>{c.label}</button>)}
        </div>

        {/* View mode */}
        <div className="flex justify-end gap-1 mb-3">
          <button onClick={() => setMode("grid")} className={`px-3 py-1 rounded-lg text-xs ${mode === "grid" ? "bg-accent text-white" : "bg-white text-gray-500"}`}>📷 グリッド</button>
          <button onClick={() => setMode("feed")} className={`px-3 py-1 rounded-lg text-xs ${mode === "feed" ? "bg-accent text-white" : "bg-white text-gray-500"}`}>📱 フィード</button>
        </div>

        {/* Grid mode — full access */}
        {mode === "grid" && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
            {posts.map((p, i) => (
              <motion.div key={p.id} whileTap={{ scale: 0.95 }} className={`relative overflow-hidden rounded-lg cursor-pointer ${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`} onClick={() => setModal(p)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className="w-full h-full aspect-square object-cover" />
                {p.isBoosted && <div className="absolute top-1 left-1 bg-accent/80 text-white text-[10px] px-1.5 py-0.5 rounded">🚀</div>}
              </motion.div>
            ))}
          </div>
        )}

        {/* Feed mode */}
        {mode === "feed" && (
          <div className="relative" style={{ height: "calc(100vh - 200px)" }}>
            {/* Promo card */}
            {isPromoIndex(fi) ? (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/10 to-white flex flex-col items-center justify-center p-8 text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold mb-2">tomoniに参加しよう</h3>
                <p className="text-gray-500 text-sm mb-6">あなたのペットのベストショットもここに載せませんか？</p>
                <Link href="/try" className="block w-full max-w-xs py-3 bg-accent text-white font-bold rounded-xl text-center mb-3">無料で試す</Link>
                <Link href="/signup" className="text-sm text-accent font-medium">登録する →</Link>
                <button onClick={() => setFi((i) => Math.min(posts.length - 1, i + 1))} className="mt-6 text-sm text-gray-400">スキップ ↓</button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={fi} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                  className="absolute inset-0 rounded-2xl overflow-hidden" drag="y" dragConstraints={{ top: 0, bottom: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -80) setFi((i) => Math.min(posts.length - 1, i + 1));
                    if (info.offset.y > 80) setFi((i) => Math.max(0, i - 1));
                  }}>
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={posts[fi].imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute right-3 bottom-32 flex flex-col gap-4 items-center">
                      <button onClick={() => authAction("like")} className="flex flex-col items-center"><span className="text-2xl">❤️</span><span className="text-white text-xs">{posts[fi].likes}</span></button>
                      <button onClick={() => authAction("comment")} className="flex flex-col items-center"><span className="text-2xl">💬</span><span className="text-white text-xs">{posts[fi].comments}</span></button>
                      <button className="flex flex-col items-center"><span className="text-2xl">🔄</span><span className="text-white text-xs">{posts[fi].shares}</span></button>
                      <div className="flex flex-col gap-2 mt-2">{["😊", "😂", "🥺", "😢"].map((e) => <button key={e} onClick={() => authAction("emotion")} className="text-xl">{e}</button>)}</div>
                    </div>
                    <div className="absolute bottom-8 left-4 right-16">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-white font-bold">{posts[fi].petName}</p>
                        <button onClick={() => authAction("follow")} className="text-xs border border-white/50 text-white px-2 py-0.5 rounded-full">フォローする</button>
                      </div>
                      <p className="text-white/90 text-sm">{posts[fi].caption}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400">↕ スワイプで次へ</p>
          </div>
        )}

        {/* Detail modal */}
        <AnimatePresence>
          {modal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4" onClick={() => setModal(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl overflow-hidden max-w-md w-full max-h-[80vh] overflow-y-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={modal.imageUrl} alt="" className="w-full aspect-square object-cover" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3"><p className="font-bold">{modal.petName}</p><span className="text-xs text-gray-400">{modal.createdAt}</span></div>
                  <p className="text-sm mb-3">{modal.caption}</p>
                  <EmotionButtons emotions={modal.emotions} likes={modal.likes} comments={modal.comments} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth modal */}
        <AuthModal isOpen={!!authTrigger} onClose={() => setAuthTrigger(null)} trigger={authTrigger || "default"} />

        {/* Fixed teal banner for non-logged-in */}
        {!isLoggedIn && !bannerDismissed && (
          <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40">
            <div className="bg-gradient-to-r from-accent to-accent-dark text-white flex items-center h-14 px-4">
              <span className="flex-1 text-sm font-medium">✨ 無料登録で、いいね・フォロー・投稿ができます</span>
              <Link href="/signup" className="px-4 py-1.5 bg-white text-accent text-xs font-bold rounded-lg flex-shrink-0 mr-2">登録する</Link>
              <button onClick={dismissBanner} className="text-white/60 hover:text-white flex-shrink-0 text-lg">✕</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
