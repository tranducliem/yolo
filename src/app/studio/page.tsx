"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, studioStyles } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

const me = mockPets[0];

export default function StudioPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [slider, setSlider] = useState(50);
  const styleObj = studioStyles.find((s) => s.id === style);

  useEffect(() => {
    if (processing) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + Math.random() * 8 + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [processing]);

  const handleConvert = () => {
    if (!isLoggedIn) {
      setAuthModal(true);
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      setStep(3);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-[#0D1B2A]">✨ YOLO Studio</h1>
          <p className="text-sm text-[#9CA3AF]">ベストショットを作品に変える</p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          {[1, 2, 3].map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: step >= s ? "#2A9D8F" : "#e5e7eb",
                  scale: step === s ? 1.1 : 1,
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "text-white" : "text-gray-400"
                }`}
              >
                {s}
              </motion.div>
              {idx < 2 && (
                <div
                  className={`w-8 h-0.5 ${
                    step > s ? "bg-accent" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step 1: Photo selection */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-3">写真を選択</h2>
              <div className="grid grid-cols-3 gap-1 mb-4">
                {me.photos.map((url, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                      photo === url ? "ring-4 ring-accent scale-[1.02]" : ""
                    }`}
                    onClick={() => setPhoto(url)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => photo && setStep(2)}
                disabled={!photo}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold disabled:opacity-40 disabled:shadow-none transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                次へ
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Style selection (6 styles) */}
          {step === 2 && !done && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-3">スタイルを選択</h2>
              <div className="grid grid-cols-3 gap-3 pb-4 mb-4">
                {studioStyles.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 rounded-xl ${
                      style === s.id ? "ring-4 ring-accent shadow-md" : ""
                    }`}
                    onClick={() => setStyle(s.id)}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo!}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ filter: s.filter }}
                      />
                      {style === s.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                    <p className="text-center text-xs font-medium mt-1">
                      {s.emoji} {s.name}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Processing overlay */}
              {processing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-6 mb-4 text-center shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="text-4xl mb-3 inline-block"
                  >
                    ✨
                  </motion.div>
                  <p className="font-bold mb-2">変換中...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-accent h-2 rounded-full"
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9CA3AF]">AIがベストショットをアートに変換しています</p>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConvert}
                disabled={!style || processing}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold disabled:opacity-40 disabled:shadow-none transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                {processing ? "✨ 変換中..." : "✨ イラスト化する"}
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Before/After slider */}
          {step === 3 && done && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-3 text-center">Before / After</h2>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo!}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo!}
                    alt="After"
                    className="w-full h-full object-cover"
                    style={{ filter: styleObj?.filter }}
                  />
                </div>
                <div
                  className="absolute inset-0 flex items-center pointer-events-none"
                  style={{ left: `${slider}%` }}
                >
                  <div className="w-1 h-full bg-white shadow-lg" />
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-accent">
                    ↔
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">Before</div>
                <div className="absolute top-3 right-3 bg-accent/80 text-white text-xs px-2 py-1 rounded-lg">After</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slider}
                  onChange={(e) => setSlider(Number(e.target.value))}
                  className="absolute bottom-4 left-4 right-4 z-10 accent-accent"
                />
              </div>

              {/* Donation badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-emerald-50 rounded-xl p-3 mb-4 flex items-center gap-2"
              >
                <span className="text-lg">🌟</span>
                <p className="text-xs text-emerald-700 font-medium">
                  グッズを購入すると5%が寄付に
                </p>
              </motion.div>

              {/* CTAs */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/book")}
                  className="py-3 rounded-xl bg-white border-2 border-[#2A9D8F] text-[#2A9D8F] text-sm font-medium hover:bg-[#F0FDFB] transition-all duration-200"
                >
                  📖 Book
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/goods")}
                  className="py-3 rounded-xl bg-white border-2 border-[#2A9D8F] text-[#2A9D8F] text-sm font-medium hover:bg-[#F0FDFB] transition-all duration-200"
                >
                  🎁 Goods
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="py-3 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-sm font-bold hover:shadow-lg transition-all duration-200"
                >
                  💝 シェア
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="illustrate" />
    </div>
  );
}
