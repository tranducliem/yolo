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
  const posts = cat === "donation" ? mockPosts.filter((p) => p.isDonationTag) : mockPosts;

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
  const isPromoIndex = (i: number) => !isLoggedIn && i > 0 && i % 5 === 0;

  // Pinterest-style: every 5th item is large
  const isLargeCard = (i: number) => i % 5 === 0;

  return (
    <>
      <div className="mx-auto max-w-lg px-4 md:max-w-4xl">
        {/* Search bar */}
        <div className="py-3">
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ペット名・タグで検索"
              className="focus:ring-accent/50 w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:outline-none"
            />
          </div>
        </div>

        {/* Categories - sticky horizontal scroll (includes donation challenge) */}
        <div className="hide-scrollbar sticky top-14 z-30 -mx-4 mb-3 flex gap-2 overflow-x-auto bg-gray-50 px-4 pb-2">
          {exploreCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                cat === c.id
                  ? c.id === "donation"
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : "bg-accent shadow-accent/20 text-white shadow-sm"
                  : c.id === "donation"
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-white text-gray-600 shadow-sm hover:bg-gray-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="mb-3 flex justify-end gap-1">
          <button
            onClick={() => setMode("grid")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              mode === "grid"
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-gray-500 shadow-sm hover:bg-gray-100"
            }`}
          >
            📷 グリッド
          </button>
          <button
            onClick={() => setMode("feed")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              mode === "feed"
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-gray-500 shadow-sm hover:bg-gray-100"
            }`}
          >
            📱 フィード
          </button>
        </div>

        {/* ===== GRID MODE ===== */}
        {mode === "grid" && (
          <div className="grid grid-cols-3 gap-1 md:grid-cols-4">
            {posts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer overflow-hidden rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  isLargeCard(i) ? "col-span-2 row-span-2" : ""
                } ${p.isDonationTag ? "ring-1 ring-emerald-300" : ""}`}
                onClick={() => setModal(p)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt=""
                  className={`aspect-square h-full w-full object-cover ${
                    p.isDonationTag ? "bg-emerald-50" : ""
                  }`}
                />
                {/* Overlay on hover/tap */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/30 hover:opacity-100">
                  <div className="flex items-center gap-3 text-sm font-medium text-white">
                    <span>❤️ {p.likes}</span>
                    <span>💬 {p.comments}</span>
                  </div>
                </div>
                {/* Donation mark */}
                {p.isDonationTag && (
                  <div className="absolute top-1 left-1 rounded bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
                    🌟
                  </div>
                )}
                {/* Boost mark */}
                {p.isBoosted && !p.isDonationTag && (
                  <div className="bg-accent/80 absolute top-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white">
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
          <div ref={feedRef} className="relative" style={{ height: "calc(100vh - 200px)" }}>
            {/* Promo card for non-logged-in users */}
            {isPromoIndex(fi) ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="from-accent/10 to-accent/5 absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b via-white p-8 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4 text-5xl"
                >
                  ✨
                </motion.div>
                <h3 className="mb-2 text-xl font-bold text-[#0D1B2A]">YOLOに参加しよう</h3>
                <p className="mb-6 text-base text-[#4B5563]">
                  あなたのペットのベストショットもここに載せませんか？
                </p>
                <Link
                  href="/try"
                  className="shadow-accent/20 mb-3 block w-full max-w-xs rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] py-3 text-center font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  ✨ うちの子も試してみる
                </Link>
                <Link
                  href="/signup"
                  className="text-accent text-sm font-medium transition-all duration-200 hover:underline"
                >
                  登録する →
                </Link>
                <button
                  onClick={() => setFi((i) => Math.min(posts.length - 1, i + 1))}
                  className="mt-6 text-sm text-gray-400 transition-all duration-200 hover:text-gray-600"
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
                  className="absolute inset-0 overflow-hidden rounded-2xl"
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -80) setFi((i) => Math.min(posts.length - 1, i + 1));
                    if (info.offset.y > 80) setFi((i) => Math.max(0, i - 1));
                  }}
                >
                  <div className="relative h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={posts[fi].imageUrl} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Donation tag indicator in feed mode */}
                    {posts[fi].isDonationTag && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-md">
                        🌟 寄付チャレンジ
                        {posts[fi].donationAmount && (
                          <span className="text-[10px] opacity-80">
                            ¥{posts[fi].donationAmount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Right side action buttons */}
                    <div className="absolute right-3 bottom-32 flex flex-col items-center gap-4">
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        onClick={() => authAction("like")}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl">❤️</span>
                        <span className="text-xs font-medium text-white">{posts[fi].likes}</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        onClick={() => authAction("comment")}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl">💬</span>
                        <span className="text-xs font-medium text-white">{posts[fi].comments}</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl">🔄</span>
                        <span className="text-xs font-medium text-white">{posts[fi].shares}</span>
                      </motion.button>
                      {/* Emotion buttons */}
                      <div className="mt-2 flex flex-col gap-2">
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
                    <div className="absolute right-16 bottom-8 left-4">
                      <div className="mb-2 flex items-center gap-2">
                        <p className="text-lg font-bold text-white">{posts[fi].petName}</p>
                        {posts[fi].ambassadorLevel && (
                          <AmbassadorBadge level={posts[fi].ambassadorLevel!} compact />
                        )}
                        <button
                          onClick={() => authAction("follow")}
                          className="rounded-full border border-white/50 px-2.5 py-0.5 text-xs text-white transition-all duration-200 hover:bg-white/20"
                        >
                          フォローする
                        </button>
                      </div>
                      <p className="mb-1 text-sm text-white/90">{posts[fi].caption}</p>
                      <div className="flex flex-wrap gap-1.5">
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
                    <div className="absolute top-3 right-3 rounded-full bg-black/40 px-2 py-1 text-xs text-white">
                      {fi + 1} / {posts.length}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            <p className="absolute right-0 bottom-2 left-0 text-center text-xs text-gray-400">
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
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"
              onClick={() => setModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] w-full max-w-md overflow-hidden overflow-y-auto rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {/* Donation header bar in modal */}
                {modal.isDonationTag && (
                  <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2">
                    <span className="text-xs font-medium text-emerald-600">
                      🌟 寄付チャレンジ投稿
                    </span>
                    {modal.donationAmount && (
                      <DonationBadge amount={modal.donationAmount} compact />
                    )}
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={modal.imageUrl} alt="" className="aspect-square w-full object-cover" />
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={modal.imageUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-[#0D1B2A]">{modal.petName}</p>
                        {modal.ambassadorLevel && (
                          <AmbassadorBadge level={modal.ambassadorLevel} compact />
                        )}
                      </div>
                      <span className="text-sm text-[#9CA3AF]">
                        {modal.ownerName} · {modal.createdAt}
                      </span>
                    </div>
                    <button
                      onClick={() => authAction("follow")}
                      className="rounded-lg bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-3 py-1 text-xs font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    >
                      フォロー
                    </button>
                  </div>
                  <p className="mb-3 text-base text-[#4B5563]">{modal.caption}</p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
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
          <div className="fixed right-0 bottom-16 left-0 z-40 md:bottom-0">
            <div className="from-accent flex h-14 items-center bg-gradient-to-r to-emerald-600 px-4 text-white">
              <span className="flex-1 text-sm font-medium">✨ うちの子も試す</span>
              <Link
                href="/try"
                className="text-accent mr-2 flex-shrink-0 rounded-lg bg-white px-4 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              >
                試してみる
              </Link>
              <button
                onClick={dismissBanner}
                className="flex-shrink-0 text-lg text-white/60 transition-all duration-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
      <FloatingCTA hasBottomNav={true} />
    </>
  );
}
