"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, availableTags, donationTags } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/features/auth/AuthGate";
import { useToast } from "@/components/ui/Toast";

const me = mockPets[0];
const visibilityOptions = [
  { id: "public", icon: "🌍", label: "全体" },
  { id: "followers", icon: "👥", label: "フォロワー" },
  { id: "private", icon: "🔒", label: "非公開" },
];

export default function PostPage() {
  return (
    <AuthGate>
      <PostInner />
    </AuthGate>
  );
}

function PostInner() {
  const router = useRouter();
  useAuth();
  const toast = useToast();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [confetti, setConfetti] = useState(false);
  const [src, setSrc] = useState<"cam" | "best">("best");
  const [posting, setPosting] = useState(false);

  // Track if any donation tag is selected
  const hasDonationTag = tags.some((t) => donationTags.includes(t));

  // Confetti particles
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string; delay: number; rotate: number }[]
  >([]);

  const handlePost = () => {
    if (!photo || posting) return;
    setPosting(true);
    setConfetti(true);

    // Generate confetti particles
    const colors = ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#264653", "#FF6B6B", "#4ECDC4"];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: -(Math.random() * 200 + 100),
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
      rotate: Math.random() * 720,
    }));
    setParticles(newParticles);

    if (hasDonationTag) {
      toast.show("🎉 +10🐾！ 🌟 保護施設に¥10届きました！");
    } else {
      toast.show("🎉 +10🐾 獲得！");
    }

    setTimeout(() => {
      router.push("/home");
    }, 2500);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const remainingChars = 200 - caption.length;

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-3xl font-bold text-[#0D1B2A]"
        >
          📷 投稿する
        </motion.h1>

        {/* Source selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex gap-2"
        >
          <button
            onClick={() => setSrc("cam")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
              src === "cam"
                ? "bg-accent shadow-accent/20 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            📱 カメラロールから
          </button>
          <button
            onClick={() => setSrc("best")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
              src === "best"
                ? "bg-accent shadow-accent/20 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            ✨ ベストショットから
          </button>
        </motion.div>

        {/* Photo grid (9 photos) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 grid grid-cols-3 gap-1.5"
        >
          {me.photos.map((url, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-all ${
                photo === url ? "ring-accent shadow-md ring-4 ring-offset-2" : "hover:opacity-80"
              }`}
              onClick={() => setPhoto(url)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {photo === url && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-accent/20 absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-accent flex h-6 w-6 items-center justify-center rounded-full">
                    <span className="text-xs text-white">✓</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Large preview */}
        <AnimatePresence>
          {photo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative mb-4"
            >
              <p className="mb-1.5 text-sm font-medium text-[#9CA3AF]">プレビュー</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                className="aspect-square w-full rounded-2xl object-cover shadow-sm"
              />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-7 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-sm text-white transition-all duration-200 hover:bg-black/70"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-gray-600">キャプション</span>
            <span
              className={`font-medium ${
                remainingChars < 20
                  ? remainingChars < 0
                    ? "text-red"
                    : "text-amber-500"
                  : "text-gray-400"
              }`}
            >
              {caption.length}/200
            </span>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 200))}
            placeholder="今日の一枚について..."
            rows={3}
            className="focus:ring-accent/50 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 hover:border-gray-300 focus:ring-2 focus:outline-none"
          />
          {/* Character count bar */}
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className={`h-full rounded-full ${
                remainingChars < 20 ? (remainingChars < 0 ? "bg-red" : "bg-amber-400") : "bg-accent"
              }`}
              animate={{ width: `${(caption.length / 200) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Tags - horizontal scroll: normal tags + donation tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-4"
        >
          <p className="mb-2 text-sm font-medium text-gray-600">タグ</p>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {/* Normal tags */}
            {availableTags.map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  tags.includes(t)
                    ? "bg-accent shadow-accent/20 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                {t}
              </motion.button>
            ))}
            {/* Donation tags - green bg + star */}
            {donationTags.map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  tags.includes(t)
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-sm"
                }`}
              >
                🌟 {t}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Donation tag selected banner */}
        <AnimatePresence>
          {hasDonationTag && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-lg"
                >
                  🌟
                </motion.span>
                <p className="text-sm font-medium text-emerald-700">この投稿は寄付に貢献します！</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visibility */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <p className="mb-2 text-sm font-medium text-gray-600">公開範囲</p>
          <div className="flex gap-2">
            {visibilityOptions.map((v) => (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibility(v.id)}
                className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition-all duration-200 ${
                  visibility === v.id
                    ? "bg-accent shadow-accent/20 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                {v.icon} {v.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Donation point hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-3"
        >
          <p className="text-center text-xs font-medium text-emerald-700">
            🌟 寄付タグで投稿すると寄付貢献ポイント+10
          </p>
        </motion.div>

        {/* Submit button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePost}
          disabled={!photo || posting}
          className={`mb-6 h-14 w-full rounded-xl text-lg font-bold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:shadow-none ${
            hasDonationTag
              ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-emerald-200"
              : "shadow-accent/20 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white"
          }`}
        >
          {posting ? (
            <span className="animate-pulse">投稿中...</span>
          ) : hasDonationTag ? (
            "🌟 寄付タグ付きで投稿する"
          ) : (
            "投稿する"
          )}
        </motion.button>

        {/* Confetti animation overlay */}
        <AnimatePresence>
          {confetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
            >
              {/* Confetti particles */}
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: [1, 1, 0],
                    x: p.x * 3,
                    y: [0, p.y, p.y + 200],
                    scale: [1, 1.2, 0.5],
                    rotate: p.rotate,
                  }}
                  transition={{
                    duration: 2,
                    delay: p.delay,
                    ease: "easeOut",
                  }}
                  className="absolute h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor: p.color,
                    left: "50%",
                    top: "50%",
                  }}
                />
              ))}

              {/* Success card */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative z-10 rounded-2xl bg-white p-8 text-center shadow-2xl"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-4 text-5xl"
                >
                  🎉
                </motion.div>
                <p className="mb-2 text-xl font-bold">投稿完了！</p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-accent text-lg font-bold"
                >
                  +10🐾 獲得！
                </motion.p>
                {hasDonationTag && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      🌟 保護施設に¥10届きました！
                    </p>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      className="mt-3 inline-block rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700"
                    >
                      🌟 寄付貢献ポイント +10
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
