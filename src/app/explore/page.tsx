"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPosts, exploreCategories } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import EmotionButtons from "@/components/features/social/EmotionButtons";
import DonationBadge from "@/components/features/donation/DonationBadge";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";
import AuthModal from "@/components/features/auth/AuthModal";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";
import FloatingCTA from "@/components/ui/FloatingCTA";

type Mode = "grid" | "feed";

export default function ExplorePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("recommend");
  const [mode, setMode] = useState<Mode>("grid");
  const [modal, setModal] = useState<(typeof mockPosts)[0] | null>(null);
  const [fi, setFi] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window !== "undefined")
      return sessionStorage.getItem("explore_banner_dismissed") === "true";
    return false;
  });
  const [authTrigger, setAuthTrigger] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Filter posts by donation category
  const posts =
    cat === "donation"
      ? mockPosts.filter((p) => p.isDonationTag)
      : mockPosts;

  const dismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem("explore_banner_dismissed", "true");
  };

  const authAction = (trigger: string) => {
    if (!isLoggedIn) {
      setAuthTrigger(trigger);
      return;
    }
  };

  // Insert promo cards in feed mode every 5 posts for non-logged-in
  const isPromoIndex = (i: number) =>
    !isLoggedIn && i > 0 && i % 5 === 0;

  // Pinterest-style: every 5th item is large
  const isLargeCard = (i: number) => i % 5 === 0;

  return (
    <div
      className={`min-h-screen bg-gray-50 ${isLoggedIn ? "pb-24 md:pb-8 lg:pl-60" : "pb-20"}`}
    >
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 py-4 sticky top-0 bg-gray-50 z-40">
          {!isLoggedIn && (
            <Link
              href="/"
              className="text-lg font-bold text-accent flex-shrink-0"
            >
              🐾
            </Link>
          )}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ペット名・タグで検索"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
          {!isLoggedIn ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/signup" className="text-xs text-gray-500">
                ログイン
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-xs font-bold rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                登録
              </Link>
            </div>
          ) : (
            <button
              onClick={() => router.push("/notifications")}
              className="text-2xl relative flex-shrink-0"
            >
              🔔
              <span className="absolute -top-1 -right-1 bg-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          )}
        </div>

        {/* Categories - sticky horizontal scroll (includes donation challenge) */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sticky top-14 bg-gray-50 z-30 mb-3 -mx-4 px-4">
          {exploreCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                cat === c.id
                  ? c.id === "donation"
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : "bg-accent text-white shadow-sm shadow-accent/20"
                  : c.id === "donation"
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex justify-end gap-1 mb-3">
          <button
            onClick={() => setMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              mode === "grid"
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-gray-100 shadow-sm"
            }`}
          >
            📷 グリッド
          </button>
          <button
            onClick={() => setMode("feed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              mode === "feed"
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-gray-100 shadow-sm"
            }`}
          >
            📱 フィード
          </button>
        </div>

        {/* ===== GRID MODE ===== */}
        {mode === "grid" && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
            {posts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                whileTap={{ scale: 0.95 }}
                className={`relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ${
                  isLargeCard(i) ? "col-span-2 row-span-2" : ""
                } ${p.isDonationTag ? "ring-1 ring-emerald-300" : ""}`}
                onClick={() => setModal(p)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt=""
                  className={`w-full h-full aspect-square object-cover ${
                    p.isDonationTag ? "bg-emerald-50" : ""
                  }`}
                />
                {/* Overlay on hover/tap */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex items-center gap-3 text-white text-sm font-medium">
                    <span>❤️ {p.likes}</span>
                    <span>💬 {p.comments}</span>
                  </div>
                </div>
                {/* Donation mark */}
                {p.isDonationTag && (
                  <div className="absolute top-1 left-1 bg-emerald-500/90 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm">
                    🌟
                  </div>
                )}
                {/* Boost mark */}
                {p.isBoosted && !p.isDonationTag && (
                  <div className="absolute top-1 left-1 bg-accent/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    🚀
                  </div>
                )}
                {/* Ambassador badge on grid */}
                {p.ambassadorLevel && p.ambassadorLevel >= 2 && (
                  <div className="absolute bottom-1 left-1">
                    <AmbassadorBadge level={p.ambassadorLevel} compact />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* ===== FEED MODE (TikTok-style) ===== */}
        {mode === "feed" && (
          <div
            ref={feedRef}
            className="relative"
            style={{ height: "calc(100vh - 200px)" }}
          >
            {/* Promo card for non-logged-in users */}
            {isPromoIndex(fi) ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/10 via-white to-accent/5 flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-4"
                >
                  ✨
                </motion.div>
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-2">YOLOに参加しよう</h3>
                <p className="text-base text-[#4B5563] mb-6">
                  あなたのペットのベストショットもここに載せませんか？
                </p>
                <Link
                  href="/try"
                  className="block w-full max-w-xs py-3 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold rounded-xl text-center shadow-md shadow-accent/20 mb-3 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  ✨ うちの子も試してみる
                </Link>
                <Link
                  href="/signup"
                  className="text-sm text-accent font-medium hover:underline transition-all duration-200"
                >
                  登録する →
                </Link>
                <button
                  onClick={() =>
                    setFi((i) => Math.min(posts.length - 1, i + 1))
                  }
                  className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-all duration-200"
                >
                  スキップ ↓
                </button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={fi}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -80)
                      setFi((i) => Math.min(posts.length - 1, i + 1));
                    if (info.offset.y > 80) setFi((i) => Math.max(0, i - 1));
                  }}
                >
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posts[fi].imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Donation tag indicator in feed mode */}
                    {posts[fi].isDonationTag && (
                      <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md flex items-center gap-1.5">
                        🌟 寄付チャレンジ
                        {posts[fi].donationAmount && (
                          <span className="text-[10px] opacity-80">
                            ¥{posts[fi].donationAmount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Right side action buttons */}
                    <div className="absolute right-3 bottom-32 flex flex-col gap-4 items-center">
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        onClick={() => authAction("like")}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl">❤️</span>
                        <span className="text-white text-xs font-medium">
                          {posts[fi].likes}
                        </span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        onClick={() => authAction("comment")}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl">💬</span>
                        <span className="text-white text-xs font-medium">
                          {posts[fi].comments}
                        </span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl">🔄</span>
                        <span className="text-white text-xs font-medium">
                          {posts[fi].shares}
                        </span>
                      </motion.button>
                      {/* Emotion buttons */}
                      <div className="flex flex-col gap-2 mt-2">
                        {["😊", "😂", "🥺", "😢"].map((e) => (
                          <motion.button
                            key={e}
                            whileTap={{ scale: 1.4 }}
                            onClick={() => authAction("emotion")}
                            className="text-xl drop-shadow-lg"
                          >
                            {e}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-8 left-4 right-16">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-white font-bold text-lg">
                          {posts[fi].petName}
                        </p>
                        {posts[fi].ambassadorLevel && (
                          <AmbassadorBadge
                            level={posts[fi].ambassadorLevel!}
                            compact
                          />
                        )}
                        <button
                          onClick={() => authAction("follow")}
                          className="text-xs border border-white/50 text-white px-2.5 py-0.5 rounded-full hover:bg-white/20 transition-all duration-200"
                        >
                          フォローする
                        </button>
                      </div>
                      <p className="text-white/90 text-sm mb-1">
                        {posts[fi].caption}
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {posts[fi].tags.map((t) => (
                          <span
                            key={t}
                            className={`text-xs font-medium ${
                              t.includes("YOLO") && posts[fi].isDonationTag
                                ? "text-emerald-300"
                                : "text-white/70"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {/* Donation badge in feed mode */}
                      {posts[fi].isDonationTag && posts[fi].donationAmount && (
                        <div className="mt-2">
                          <DonationBadge amount={posts[fi].donationAmount} />
                        </div>
                      )}
                    </div>

                    {/* Post counter */}
                    <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                      {fi + 1} / {posts.length}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400">
              ↕ スワイプで次へ
            </p>
          </div>
        )}

        {/* Detail modal (grid tap) */}
        <AnimatePresence>
          {modal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4"
              onClick={() => setModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden max-w-md w-full max-h-[85vh] overflow-y-auto transition-all duration-200"
              >
                {/* Donation header bar in modal */}
                {modal.isDonationTag && (
                  <div className="bg-emerald-50 px-4 py-2 flex items-center gap-2">
                    <span className="text-xs text-emerald-600 font-medium">
                      🌟 寄付チャレンジ投稿
                    </span>
                    {modal.donationAmount && (
                      <DonationBadge amount={modal.donationAmount} compact />
                    )}
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={modal.imageUrl}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={modal.imageUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-[#0D1B2A]">{modal.petName}</p>
                        {modal.ambassadorLevel && (
                          <AmbassadorBadge
                            level={modal.ambassadorLevel}
                            compact
                          />
                        )}
                      </div>
                      <span className="text-sm text-[#9CA3AF]">
                        {modal.ownerName} · {modal.createdAt}
                      </span>
                    </div>
                    <button
                      onClick={() => authAction("follow")}
                      className="px-3 py-1 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-xs font-bold rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      フォロー
                    </button>
                  </div>
                  <p className="text-base text-[#4B5563] mb-3">{modal.caption}</p>
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {modal.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-xs font-medium ${
                          t.includes("YOLO") && modal.isDonationTag
                            ? "text-emerald-600"
                            : "text-accent"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {/* Donation badge in modal */}
                  {modal.isDonationTag && modal.donationAmount && (
                    <div className="mb-3">
                      <DonationBadge amount={modal.donationAmount} />
                    </div>
                  )}
                  <EmotionButtons
                    emotions={modal.emotions}
                    likes={modal.likes}
                    comments={modal.comments}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth modal */}
        <AuthModal
          isOpen={!!authTrigger}
          onClose={() => setAuthTrigger(null)}
          trigger={authTrigger || "default"}
        />

        {/* Fixed bottom banner for non-logged-in */}
        {!isLoggedIn && !bannerDismissed && (
          <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40">
            <div className="bg-gradient-to-r from-accent to-emerald-600 text-white flex items-center h-14 px-4">
              <span className="flex-1 text-sm font-medium">
                ✨ うちの子も試す
              </span>
              <Link
                href="/try"
                className="px-4 py-1.5 bg-white text-accent text-xs font-bold rounded-lg flex-shrink-0 mr-2 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                試してみる
              </Link>
              <button
                onClick={dismissBanner}
                className="text-white/60 hover:text-white flex-shrink-0 text-lg transition-all duration-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
      <FloatingCTA hasBottomNav={true} />
      <BottomNav />
    </div>
  );
}
