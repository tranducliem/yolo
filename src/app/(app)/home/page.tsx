"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockPets, mockPosts, mockDares } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import EmotionButtons from "@/components/features/social/EmotionButtons";
import AuthModal from "@/components/features/auth/AuthModal";
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
      1000,
    );
    return () => clearInterval(iv);
  }, []);

  // Emotion counter increment
  useEffect(() => {
    const iv = setInterval(() => setEmoCount((c) => c + 1 + Math.floor(Math.random() * 3)), 1000);
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-lg px-4 md:max-w-4xl">
        {/* ① Today's Best Shot — Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 25 }}
          className="relative mb-4 overflow-hidden rounded-2xl shadow-lg"
        >
          {/* Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bestShot.imageUrl}
            alt={bestShot.name}
            className="aspect-[4/3] w-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* AI badge — top left */}
          <div className="absolute top-3 left-3">
            <span className="text-accent inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-sm">
              ✨ AIベストショット
            </span>
          </div>

          {/* Donation badge — top right */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
              🌟 ¥12 寄付済み
            </span>
          </div>

          {/* Content overlay — bottom */}
          <div className="absolute right-0 bottom-0 left-0 p-4">
            <div className="flex items-end justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">{bestShot.name}</h2>
                  {bestShot.ambassadorLevel && (
                    <AmbassadorBadge level={bestShot.ambassadorLevel} compact />
                  )}
                </div>
                <p className="text-xs text-white/80 drop-shadow">
                  {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric" })} ・{" "}
                  {bestShot.ownerName}
                </p>
                <p className="mt-1.5 line-clamp-2 text-sm text-white/90 drop-shadow">
                  窓辺の光が{bestShot.name}の瞳をキラキラにしています ✨
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/95 py-2.5 text-sm font-bold text-[#0D1B2A] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              >
                💝 家族に送る
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (authAction("goods")) router.push("/goods");
                }}
                className="bg-gold/90 hover:bg-gold flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition-colors"
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
          className="mb-4 flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2.5 transition-all duration-200 hover:shadow-sm"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg"
          >
            🌟
          </motion.span>
          <p className="flex-1 text-sm font-medium text-emerald-700">
            今月あなたの写真で<span className="font-bold">32匹</span>の食事が届きました
          </p>
          <span className="text-xs font-medium text-emerald-500">詳細 →</span>
        </motion.div>

        {/* ③ Two Action Cards — Dare + Battle */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {/* Dare Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => {
              if (!authAction("post")) return;
              toast.show("Coming Soon: Dare は準備中です");
            }}
            className="border-accent cursor-pointer rounded-2xl border-t-4 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 text-2xl">🎯</div>
            <p className="mb-0.5 text-xs font-medium text-gray-500">今週のお題</p>
            <p className="mb-2 line-clamp-2 text-sm leading-snug font-bold text-[#0D1B2A]">
              {activeDare.hashtag}
            </p>
            {activeDare.isDonationChallenge && (
              <span className="mb-2 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
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
              <span className="text-accent text-xs font-bold">参加する →</span>
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
            className="border-gold cursor-pointer rounded-2xl border-t-4 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 text-2xl">⚔️</div>
            <p className="mb-0.5 text-xs font-medium text-gray-500">にらめっこバトル</p>
            <p className="mb-2 line-clamp-2 text-sm leading-snug font-bold text-[#0D1B2A]">
              {battleDare.hashtag}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">
                🏆 1位: {battleDare.rewards.first}🐾
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">
                👥 {battleDare.participants.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400">
                📸 {battleDare.posts.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-center">
              <span className="text-gold text-xs font-bold">挑戦する →</span>
            </div>
          </motion.div>
        </div>

        {/* ④ Crown Card — below fold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="border-gold relative mb-4 cursor-pointer overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-[#FFF8E1] to-[#FFFDE7] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => toast.show("Coming Soon: Crown は準備中です")}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -skew-x-12 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="from-gold absolute -inset-1 rounded-xl bg-gradient-to-r to-amber-400 opacity-50 blur-sm" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={crown.imageUrl}
                alt={crown.name}
                className="border-gold relative h-20 w-20 rounded-xl border-2 object-cover shadow"
              />
            </div>
            <div className="flex-1">
              <p className="text-gold text-sm font-bold">👑 今日の1匹</p>
              <div className="flex items-center gap-1.5">
                <p className="text-lg font-bold">{crown.name}</p>
                {crown.ambassadorLevel && <AmbassadorBadge level={crown.ambassadorLevel} compact />}
              </div>
              <p className="text-xs text-gray-500">
                {crown.breed} ・ {crown.ownerName}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-gray-400">❤️ {crown.likeCount.toLocaleString()}</span>
                <span className="text-xs text-gray-400">👥 {crown.followers.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">残り</p>
              <p className="text-gold font-mono text-lg font-bold">{cdStr}</p>
            </div>
          </div>
        </motion.div>

        {/* ⑤ Emotion Counter — below fold */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-4 rounded-2xl bg-white p-5 py-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="mb-1 text-sm text-[#9CA3AF]">YOLOは今日</p>
          <motion.p
            key={emoCount}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-accent text-3xl font-bold"
          >
            {emoCount.toLocaleString()}人
          </motion.p>
          <p className="mt-1 text-sm text-[#9CA3AF]">を笑顔にしました</p>
        </motion.div>

        {/* ⑥ Recommended horizontal scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0D1B2A]">あなたへのおすすめ</h2>
            <button
              onClick={() => router.push("/explore")}
              className="text-accent text-sm font-medium transition-all duration-200 hover:underline"
            >
              もっと見る →
            </button>
          </div>
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
            {mockPosts.slice(0, 3).map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="w-36 flex-shrink-0"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-36 w-36 rounded-xl object-cover shadow-sm"
                  />
                  <div className="absolute right-1 bottom-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                    ❤️ {p.likes}
                  </div>
                  {p.isDonationTag && (
                    <div className="absolute top-1 left-1 rounded bg-emerald-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      🌟
                    </div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  <p className="truncate text-xs font-medium">{p.petName}</p>
                  {p.ambassadorLevel && <AmbassadorBadge level={p.ambassadorLevel} compact />}
                </div>
                <p className="truncate text-[10px] text-gray-400">{p.caption}</p>
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
              className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                post.isDonationTag ? "ring-1 ring-emerald-200" : ""
              }`}
            >
              {/* Post header */}
              <div className="flex items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt=""
                  className="h-9 w-9 rounded-full border border-gray-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold">{post.petName}</p>
                    {post.ambassadorLevel && (
                      <AmbassadorBadge level={post.ambassadorLevel} compact />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {post.ownerName} · {post.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {post.isDonationTag && <DonationBadge amount={post.donationAmount} compact />}
                  {post.isBoosted && (
                    <span className="bg-accent/10 text-accent rounded-full px-2 py-0.5 text-xs font-medium">
                      🚀 Boost
                    </span>
                  )}
                </div>
              </div>

              {/* Donation tag banner */}
              {post.isDonationTag && (
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5">
                  <span className="text-xs font-medium text-emerald-600">
                    🌟 この投稿は保護施設への寄付に貢献しています
                  </span>
                  {post.donationAmount && (
                    <span className="ml-auto text-[10px] text-emerald-500">
                      ¥{post.donationAmount}
                    </span>
                  )}
                </div>
              )}

              {/* Post image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt="" className="aspect-square w-full object-cover" />

              {/* Post actions */}
              <div className="p-3">
                <EmotionButtons
                  emotions={post.emotions}
                  likes={post.likes}
                  comments={post.comments}
                />
                <p className="mt-2 text-sm">{post.caption}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
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
            className="from-accent/10 to-accent/5 mt-6 mb-4 rounded-2xl bg-gradient-to-r p-6 text-center"
          >
            <div className="mb-2 text-3xl">🐾</div>
            <h3 className="mb-1 text-lg font-bold text-[#0D1B2A]">もっと楽しもう</h3>
            <p className="mb-2 text-base text-[#4B5563]">
              登録して、いいね・フォロー・投稿を始めよう
            </p>
            <p className="mb-4 text-xs font-medium text-emerald-600">
              🌟 会員の活動が保護施設への寄付につながります
            </p>
            <Link
              href="/signup"
              className="shadow-accent/20 inline-block rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-8 py-3 font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
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
    </>
  );
}
