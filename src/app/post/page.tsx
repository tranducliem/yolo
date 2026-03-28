"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, availableTags, donationTags } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import { useToast } from "@/components/Toast";

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
  const { user } = useAuth();
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
    { id: number; x: number; y: number; color: string; delay: number }[]
  >([]);

  const handlePost = () => {
    if (!photo || posting) return;
    setPosting(true);
    setConfetti(true);

    // Generate confetti particles
    const colors = [
      "#2A9D8F",
      "#E9C46A",
      "#F4A261",
      "#E76F51",
      "#264653",
      "#FF6B6B",
      "#4ECDC4",
    ];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: -(Math.random() * 200 + 100),
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
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
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const remainingChars = 200 - caption.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-6">
        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#0D1B2A] mb-6"
        >
          📷 投稿する
        </motion.h1>

        {/* Source selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          <button
            onClick={() => setSrc("cam")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              src === "cam"
                ? "bg-accent text-white shadow-sm shadow-accent/20"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            📱 カメラロールから
          </button>
          <button
            onClick={() => setSrc("best")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              src === "best"
                ? "bg-accent text-white shadow-sm shadow-accent/20"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm"
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
          className="grid grid-cols-3 gap-1.5 mb-4"
        >
          {me.photos.map((url, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer relative transition-all ${
                photo === url
                  ? "ring-4 ring-accent ring-offset-2 shadow-md"
                  : "hover:opacity-80"
              }`}
              onClick={() => setPhoto(url)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
              {photo === url && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-accent/20 flex items-center justify-center"
                >
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
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
              className="mb-4 relative"
            >
              <p className="text-sm text-[#9CA3AF] mb-1.5 font-medium">
                プレビュー
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                className="w-full aspect-square rounded-2xl object-cover shadow-sm"
              />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-7 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70 transition-all duration-200"
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
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600 font-medium">キャプション</span>
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all duration-200 hover:border-gray-300"
          />
          {/* Character count bar */}
          <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                remainingChars < 20
                  ? remainingChars < 0
                    ? "bg-red"
                    : "bg-amber-400"
                  : "bg-accent"
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
          <p className="text-sm font-medium text-gray-600 mb-2">タグ</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {/* Normal tags */}
            {availableTags.map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  tags.includes(t)
                    ? "bg-accent text-white shadow-sm shadow-accent/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5"
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  tags.includes(t)
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:shadow-sm hover:-translate-y-0.5"
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-lg"
                >
                  🌟
                </motion.span>
                <p className="text-sm text-emerald-700 font-medium">
                  この投稿は寄付に貢献します！
                </p>
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
          <p className="text-sm font-medium text-gray-600 mb-2">公開範囲</p>
          <div className="flex gap-2">
            {visibilityOptions.map((v) => (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibility(v.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  visibility === v.id
                    ? "bg-accent text-white shadow-sm shadow-accent/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-sm"
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
          className="mb-6 bg-emerald-50 border border-emerald-100 rounded-xl p-3"
        >
          <p className="text-xs text-emerald-700 font-medium text-center">
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
          className={`w-full h-14 rounded-xl font-bold text-lg shadow-lg disabled:opacity-40 disabled:shadow-none transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mb-6 ${
            hasDonationTag
              ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-emerald-200"
              : "bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white shadow-accent/20"
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
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 pointer-events-none"
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
                    rotate: Math.random() * 720,
                  }}
                  transition={{
                    duration: 2,
                    delay: p.delay,
                    ease: "easeOut",
                  }}
                  className="absolute w-3 h-3 rounded-sm"
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
                className="bg-white rounded-2xl p-8 text-center shadow-2xl relative z-10"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-5xl mb-4"
                >
                  🎉
                </motion.div>
                <p className="text-xl font-bold mb-2">投稿完了！</p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-accent font-bold text-lg"
                >
                  +10🐾 獲得！
                </motion.p>
                {hasDonationTag && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-sm text-emerald-600 mt-2 font-medium">
                      🌟 保護施設に¥10届きました！
                    </p>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      className="mt-3 inline-block bg-emerald-50 text-emerald-700 text-xs px-4 py-2 rounded-full font-medium"
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
      <BottomNav />
    </div>
  );
}
