"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockPets, mockPosts, mockDares } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import EmotionButtons from "@/components/features/social/EmotionButtons";
import AuthModal from "@/components/features/auth/AuthModal";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";
import DonationBadge from "@/components/features/donation/DonationBadge";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";
import { useToast } from "@/components/ui/Toast";

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, loaded } = useAuth();
  const toast = useToast();
  const [emoCount, setEmoCount] = useState(12847);
  const [authTrigger, setAuthTrigger] = useState<string | null>(null);
  const crown = mockPets[0];
  const bestShot = mockPets[1] || mockPets[0];
  const feed = mockPosts.slice(0, 5);
  const activeDare = mockDares.find((d) => d.status === "active") || mockDares[0];
  const battleDare = mockDares[1] || mockDares[0];

  // Countdown timer
  const [cd, setCd] = useState({ h: 14, m: 32, s: 7 });
  useEffect(() => {
    const iv = setInterval(
      () =>
        setCd((p) => {
          let { h, m, s } = p;
          s--;
          if (s < 0) {
            s = 59;
            m--;
          }
          if (m < 0) {
            m = 59;
            h--;
          }
          if (h < 0) {
            h = 23;
            m = 59;
            s = 59;
          }
          return { h, m, s };
        }),
      1000
    );
    return () => clearInterval(iv);
  }, []);

  // Emotion counter increment
  useEffect(() => {
    const iv = setInterval(
      () => setEmoCount((c) => c + 1 + Math.floor(Math.random() * 3)),
      1000
    );
    return () => clearInterval(iv);
  }, []);

  const cdStr = `${String(cd.h).padStart(2, "0")}:${String(cd.m).padStart(2, "0")}:${String(cd.s).padStart(2, "0")}`;

  const authAction = (trigger: string) => {
    if (!isLoggedIn) {
      setAuthTrigger(trigger);
      return false;
    }
    return true;
  };

  const handleShare = async () => {
    const shareData = {
      title: `${bestShot.name}のベストショット - YOLO`,
      text: `${bestShot.name}の今日のベストショットを見て！ #YOLO #ペット`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.show("リンクをコピーしました！");
      }
    } catch {
      // user cancelled share
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4 sticky top-0 bg-gray-50 z-40">
          <h1 className="text-3xl font-bold text-[#0D1B2A]">🐾 YOLO</h1>
          <div className="flex items-center gap-3">
            {!isLoggedIn && (
              <Link
                href="/signup"
                className="px-3 py-1.5 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-xs font-bold rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                登録
              </Link>
            )}
            <button
              onClick={() => {
                if (authAction("default")) router.push("/notifications");
              }}
              className="relative"
            >
              <span className="text-2xl">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* ① Today's Best Shot — Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 25 }}
          className="relative rounded-2xl overflow-hidden mb-4 shadow-lg"
        >
          {/* Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bestShot.imageUrl}
            alt={bestShot.name}
            className="w-full aspect-[4/3] object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* AI badge — top left */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-accent px-2.5 py-1 rounded-full shadow-sm">
              ✨ AIベストショット
            </span>
          </div>

          {/* Donation badge — top right */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-xs font-bold text-white px-2.5 py-1 rounded-full shadow-sm">
              🌟 ¥12 寄付済み
            </span>
          </div>

          {/* Content overlay — bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white text-xl font-bold drop-shadow-lg">
                    {bestShot.name}
                  </h2>
                  {bestShot.ambassadorLevel && (
                    <AmbassadorBadge level={bestShot.ambassadorLevel} compact />
                  )}
                </div>
                <p className="text-white/80 text-xs drop-shadow">
                  {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric" })} ・ {bestShot.ownerName}
                </p>
                <p className="text-white/90 text-sm mt-1.5 drop-shadow line-clamp-2">
                  窓辺の光が{bestShot.name}の瞳をキラキラにしています ✨
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#0D1B2A] text-sm font-bold py-2.5 rounded-xl shadow-sm hover:bg-white transition-colors"
              >
                💝 家族に送る
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (authAction("goods")) router.push("/goods");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gold/90 backdrop-blur-sm text-white text-sm font-bold py-2.5 rounded-xl shadow-sm hover:bg-gold transition-colors"
              >
                🎁 グッズにする
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ② Donation Impact Mini Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push("/donation")}
          className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-2.5 cursor-pointer hover:shadow-sm transition-all duration-200 flex items-center gap-2"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg"
          >
            🌟
          </motion.span>
          <p className="text-sm font-medium text-emerald-700 flex-1">
            今月あなたの写真で<span className="font-bold">32匹</span>の食事が届きました
          </p>
          <span className="text-emerald-500 text-xs font-medium">詳細 →</span>
        </motion.div>

        {/* ③ Two Action Cards — Dare + Battle */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Dare Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => {
              if (!authAction("post")) return;
              toast.show("Coming Soon: Dare は準備中です");
            }}
            className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-accent cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">今週のお題</p>
            <p className="text-sm font-bold text-[#0D1B2A] leading-snug mb-2 line-clamp-2">
              {activeDare.hashtag}
            </p>
            {activeDare.isDonationChallenge && (
              <span className="inline-block text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium mb-2">
                🌟 寄付チャレンジ
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">
                👥 {activeDare.participants.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400">
                📸 {activeDare.posts.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-accent">参加する →</span>
            </div>
          </motion.div>

          {/* Battle Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => {
              if (!authAction("battle")) return;
              toast.show("Coming Soon: Battle は準備中です");
            }}
            className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-gold cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-2xl mb-2">⚔️</div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">にらめっこバトル</p>
            <p className="text-sm font-bold text-[#0D1B2A] leading-snug mb-2 line-clamp-2">
              {battleDare.hashtag}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">
                🏆 1位: {battleDare.rewards.first}🐾
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-gray-400">
                👥 {battleDare.participants.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400">
                📸 {battleDare.posts.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-gold">挑戦する →</span>
            </div>
          </motion.div>
        </div>

        {/* ④ Crown Card — below fold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-gradient-to-br from-[#FFF8E1] to-[#FFFDE7] border-2 border-gold rounded-2xl p-5 mb-4 overflow-hidden relative cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          onClick={() => toast.show("Coming Soon: Crown は準備中です")}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-gold to-amber-400 rounded-xl opacity-50 blur-sm" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={crown.imageUrl}
                alt={crown.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-gold shadow relative"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gold font-bold">👑 今日の1匹</p>
              <div className="flex items-center gap-1.5">
                <p className="text-lg font-bold">{crown.name}</p>
                {crown.ambassadorLevel && (
                  <AmbassadorBadge level={crown.ambassadorLevel} compact />
                )}
              </div>
              <p className="text-xs text-gray-500">
                {crown.breed} ・ {crown.ownerName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">
                  ❤️ {crown.likeCount.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">
                  👥 {crown.followers.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">残り</p>
              <p className="font-mono font-bold text-gold text-lg">{cdStr}</p>
            </div>
          </div>
        </motion.div>

        {/* ⑤ Emotion Counter — below fold */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center py-6 mb-4 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5"
        >
          <p className="text-sm text-[#9CA3AF] mb-1">YOLOは今日</p>
          <motion.p
            key={emoCount}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-accent"
          >
            {emoCount.toLocaleString()}人
          </motion.p>
          <p className="text-sm text-[#9CA3AF] mt-1">を笑顔にしました</p>
        </motion.div>

        {/* ⑥ Recommended horizontal scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-[#0D1B2A]">あなたへのおすすめ</h2>
            <button
              onClick={() => router.push("/explore")}
              className="text-accent text-sm font-medium hover:underline transition-all duration-200"
            >
              もっと見る →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {mockPosts.slice(0, 3).map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex-shrink-0 w-36"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="w-36 h-36 rounded-xl object-cover shadow-sm"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    ❤️ {p.likes}
                  </div>
                  {p.isDonationTag && (
                    <div className="absolute top-1 left-1 bg-emerald-500/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      🌟
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <p className="text-xs font-medium truncate">{p.petName}</p>
                  {p.ambassadorLevel && (
                    <AmbassadorBadge level={p.ambassadorLevel} compact />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">
                  {p.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0D1B2A]">タイムライン</h2>
          {feed.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                post.isDonationTag ? "ring-1 ring-emerald-200" : ""
              }`}
            >
              {/* Post header */}
              <div className="flex items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold truncate">{post.petName}</p>
                    {post.ambassadorLevel && (
                      <AmbassadorBadge level={post.ambassadorLevel} compact />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {post.ownerName} · {post.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {post.isDonationTag && (
                    <DonationBadge amount={post.donationAmount} compact />
                  )}
                  {post.isBoosted && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                      🚀 Boost
                    </span>
                  )}
                </div>
              </div>

              {/* Donation tag banner */}
              {post.isDonationTag && (
                <div className="bg-emerald-50 px-3 py-1.5 flex items-center gap-2">
                  <span className="text-xs text-emerald-600 font-medium">
                    🌟 この投稿は保護施設への寄付に貢献しています
                  </span>
                  {post.donationAmount && (
                    <span className="text-[10px] text-emerald-500 ml-auto">
                      ¥{post.donationAmount}
                    </span>
                  )}
                </div>
              )}

              {/* Post image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt=""
                className="w-full aspect-square object-cover"
              />

              {/* Post actions */}
              <div className="p-3">
                <EmotionButtons
                  emotions={post.emotions}
                  likes={post.likes}
                  comments={post.comments}
                />
                <p className="text-sm mt-2">{post.caption}</p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className={`text-xs font-medium ${
                        t.includes("YOLO") && post.isDonationTag
                          ? "text-emerald-600"
                          : "text-accent"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Non-logged-in CTA at bottom of feed */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 mb-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-6 text-center"
          >
            <div className="text-3xl mb-2">🐾</div>
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">もっと楽しもう</h3>
            <p className="text-base text-[#4B5563] mb-2">
              登録して、いいね・フォロー・投稿を始めよう
            </p>
            <p className="text-xs text-emerald-600 font-medium mb-4">
              🌟 会員の活動が保護施設への寄付につながります
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold rounded-xl shadow-md shadow-accent/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              無料で始める
            </Link>
          </motion.div>
        )}
      </div>

      {/* Auth modal for non-logged-in actions */}
      <AuthModal
        isOpen={!!authTrigger}
        onClose={() => setAuthTrigger(null)}
        trigger={authTrigger || "default"}
      />

      <BottomNav />
    </div>
  );
}
