"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Confetti particle component
function Confetti() {
  const [particles, setParticles] = useState<
    {
      id: number;
      x: number;
      delay: number;
      duration: number;
      color: string;
      size: number;
      rotation: number;
    }[]
  >([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only particle generation
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#264653", "#FF6B9D"][i % 6],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      })),
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rotation + 720, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
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

interface OrderData {
  order_number: string;
  total: number;
  donation_amount: number;
  created_at: string;
  items: { name: string; price: number; quantity: number }[];
}

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [showConfetti, setShowConfetti] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.order) setOrder(d.order);
        })
        .catch(() => {});
    }
  }, [orderId]);

  const donationAmount = order?.donation_amount || 0;
  const orderNumber = order?.order_number || "";
  const mealsProvided = Math.max(1, Math.floor(donationAmount / 50));

  // Estimate delivery: 7 days from order
  const deliveryDate = order?.created_at
    ? new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "ja-JP",
      )
    : "";

  const handleShare = async () => {
    const shareData = {
      title: "YOLOで動物を救いました！",
      text: `YOLOでのお買い物で¥${donationAmount.toLocaleString()}が保護施設に届けられました！`,
      url: "https://yolo-pet.app",
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="relative z-20 mx-auto max-w-lg px-4 pt-10 md:max-w-4xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-6 flex justify-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-3xl font-bold text-[#0D1B2A]">
            🎉 ご注文ありがとうございます！
          </h1>
          <p className="text-base text-[#4B5563]">ご注文の確認メールをお送りしました</p>
        </motion.div>

        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="space-y-3">
            {orderNumber && (
              <div className="flex items-center justify-between">
                <span className="text-base text-[#4B5563]">注文番号</span>
                <span className="text-accent font-mono text-sm font-bold">{orderNumber}</span>
              </div>
            )}
            {deliveryDate && (
              <div className="flex items-center justify-between">
                <span className="text-base text-[#4B5563]">お届け予定日</span>
                <span className="text-sm font-bold">{deliveryDate}</span>
              </div>
            )}
            {order && (
              <div className="flex items-center justify-between">
                <span className="text-base text-[#4B5563]">合計</span>
                <span className="text-accent text-lg font-bold">
                  ¥{order.total.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Donation Complete Message */}
        {donationAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative mb-4 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-5 shadow-sm"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-3 right-3 text-lg"
            >
              ✨
            </motion.div>

            <div className="mb-4 text-center">
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="text-xl font-bold text-emerald-700"
              >
                🌟 ¥{donationAmount.toLocaleString()}が保護施設に届けられます！
              </motion.p>
              <p className="mt-2 text-sm text-emerald-600">
                約{mealsProvided}食分の食事を届けることができます
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] py-3 font-bold text-white shadow-md shadow-emerald-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              📤 寄付をシェアする
            </motion.button>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8 space-y-3"
        >
          <Link
            href="/orders"
            className="shadow-accent/20 block w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] py-4 text-center text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            📦 注文を確認する
          </Link>
          <Link
            href="/home"
            className="block w-full rounded-xl border-2 border-[#2A9D8F] bg-white py-4 text-center text-lg font-bold text-[#2A9D8F] transition-all duration-200 hover:bg-[#F0FDFB]"
          >
            🏠 ホームに戻る
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="/book">
            <div className="from-accent/10 border-accent/20 rounded-2xl border bg-gradient-to-r to-yellow-50 p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <p className="mb-1 text-lg font-bold text-[#0D1B2A]">
                ✨ 次はフォトブックもいかがですか？
              </p>
              <p className="text-base text-[#4B5563]">ベストショットをまとめて1冊に</p>
              <span className="mt-2 inline-block text-sm font-bold text-[#2A9D8F]">
                フォトブックを作る →
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#2A9D8F] border-t-transparent" />
        </div>
      }
    >
      <OrderCompleteContent />
    </Suspense>
  );
}
