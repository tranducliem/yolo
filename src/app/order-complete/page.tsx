"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

// Confetti particle component (40 particles)
function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: [
        "#2A9D8F",
        "#E9C46A",
        "#F4A261",
        "#E76F51",
        "#264653",
        "#FF6B9D",
      ][i % 6],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}vw`,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: "110vh",
            rotate: p.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size > 10 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function OrderCompletePage() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const orderNumber = "#YOLO-20260327-001";
  const deliveryEstimate = "2026年4月3日";
  const donationAmount = 490;
  const rescuedDogName = "ハナちゃん";
  const rescuedDogImage =
    "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&h=500&fit=crop";

  const handleShare = async () => {
    const shareData = {
      title: "YOLOで動物を救いました！",
      text: `YOLOでのお買い物で¥${donationAmount.toLocaleString()}が福岡の保護施設に届けられました！あなたも一緒に動物を救いませんか？`,
      url: "https://yolo-pet.app",
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        alert("クリップボードにコピーしました！");
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      {showConfetti && <Confetti />}

      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-10 relative z-20">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl"
            >
              ✅
            </motion.span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">
            🎉 ご注文ありがとうございます！
          </h1>
          <p className="text-base text-[#4B5563]">
            ご注文の確認メールをお送りしました
          </p>
        </motion.div>

        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-4"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base text-[#4B5563]">注文番号</span>
              <span className="font-mono font-bold text-sm text-accent">
                {orderNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base text-[#4B5563]">お届け予定日</span>
              <span className="font-bold text-sm">{deliveryEstimate}</span>
            </div>
          </div>
        </motion.div>

        {/* Donation Complete Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-4 border border-emerald-100 overflow-hidden relative"
        >
          {/* Sparkle decorations */}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-3 right-3 text-lg"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-3 left-3 text-lg"
          >
            ✨
          </motion.div>

          <div className="text-center mb-4">
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="text-xl font-bold text-emerald-700"
            >
              🌟 ¥{donationAmount.toLocaleString()}が福岡の保護施設に届けられます！
            </motion.p>
          </div>

          <div className="flex items-center gap-4 bg-white/60 rounded-xl p-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rescuedDogImage}
                alt={rescuedDogName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-700">
                あなたのおかげで{rescuedDogName}の食事3日分になります
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                NPO法人アニマルレスキュー福岡
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="w-full mt-4 bg-gradient-to-r from-[#059669] to-[#047857] text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            📤 寄付をシェアする
          </motion.button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 mb-8"
        >
          <Link
            href="/orders"
            className="block w-full bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold py-4 rounded-xl text-center text-lg shadow-lg shadow-accent/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            📦 注文を確認する
          </Link>
          <Link
            href="/home"
            className="block w-full bg-white border-2 border-[#2A9D8F] text-[#2A9D8F] font-bold py-4 rounded-xl text-center text-lg hover:bg-[#F0FDFB] transition-all duration-200"
          >
            🏠 ホームに戻る
          </Link>
        </motion.div>

        {/* Upsell Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="/book">
            <div className="bg-gradient-to-r from-accent/10 to-yellow-50 rounded-2xl p-5 border border-accent/20 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-lg font-bold text-[#0D1B2A] mb-1">
                ✨ 次はフォトブックもいかがですか？
              </p>
              <p className="text-base text-[#4B5563]">
                ベストショットをまとめて1冊に
              </p>
              <span className="inline-block mt-2 text-[#2A9D8F] font-bold text-sm">
                フォトブックを作る →
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
