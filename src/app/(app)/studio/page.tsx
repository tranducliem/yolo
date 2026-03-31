"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { studioStyles } from "@/config/studio";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";

interface PetMe {
  id: string;
  name: string;
  imageUrl: string;
  photos: string[];
}

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
  const [me, setMe] = useState<PetMe | null>(null);
  const [meLoading, setMeLoading] = useState(true);
  const styleObj = studioStyles.find((s) => s.id === style);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/pets/me");
      if (res.ok) {
        const data = await res.json();
        if (data.pet) setMe(data.pet);
      }
    } catch {
      /* no fallback */
    } finally {
      setMeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

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
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-bold text-[#0D1B2A]">✨ YOLO Studio</h1>
          <p className="text-sm text-[#9CA3AF]">ベストショットを作品に変える</p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center justify-center gap-2"
        >
          {[1, 2, 3].map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: step >= s ? "#2A9D8F" : "#e5e7eb",
                  scale: step === s ? 1.1 : 1,
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step >= s ? "text-white" : "text-gray-400"
                }`}
              >
                {s}
              </motion.div>
              {idx < 2 && <div className={`h-0.5 w-8 ${step > s ? "bg-accent" : "bg-gray-200"}`} />}
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
              <h2 className="mb-3 text-2xl font-bold text-[#0D1B2A]">写真を選択</h2>
              {meLoading ? (
                <div className="mb-4 grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
                  ))}
                </div>
              ) : me && me.photos.length > 0 ? (
                <>
                  <div className="mb-4 grid grid-cols-3 gap-1">
                    {me.photos.map((url, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`aspect-square cursor-pointer overflow-hidden rounded-lg transition-all ${
                          photo === url ? "ring-accent scale-[1.02] ring-4" : ""
                        }`}
                        onClick={() => setPhoto(url)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => photo && setStep(2)}
                    disabled={!photo}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                  >
                    次へ
                  </motion.button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="mb-2 text-4xl">📷</p>
                  <p className="mb-1 text-lg font-bold text-gray-700">写真がありません</p>
                  <p className="mb-4 text-sm text-gray-400">
                    ベストショットを撮って写真を追加しましょう
                  </p>
                  <Link
                    href="/try"
                    className="rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    ✨ ベストショットを撮る
                  </Link>
                </div>
              )}
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
              <h2 className="mb-3 text-2xl font-bold text-[#0D1B2A]">スタイルを選択</h2>
              <div className="mb-4 grid grid-cols-3 gap-3 pb-4">
                {studioStyles.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`cursor-pointer rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      style === s.id ? "ring-accent shadow-md ring-4" : ""
                    }`}
                    onClick={() => setStyle(s.id)}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo!}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ filter: s.filter }}
                      />
                      {style === s.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-accent absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                    <p className="mt-1 text-center text-xs font-medium">
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
                  className="mb-4 rounded-2xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="mb-3 inline-block text-4xl"
                  >
                    ✨
                  </motion.div>
                  <p className="mb-2 font-bold">変換中...</p>
                  <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                    <motion.div
                      className="bg-accent h-2 rounded-full"
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    AIがベストショットをアートに変換しています
                  </p>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConvert}
                disabled={!style || processing}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
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
              <h2 className="mb-3 text-center text-2xl font-bold text-[#0D1B2A]">Before / After</h2>
              <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo!}
                  alt="Before"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo!}
                    alt="After"
                    className="h-full w-full object-cover"
                    style={{ filter: styleObj?.filter }}
                  />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 flex items-center"
                  style={{ left: `${slider}%` }}
                >
                  <div className="h-full w-1 bg-white shadow-lg" />
                  <div className="text-accent absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold shadow-lg">
                    ↔
                  </div>
                </div>
                <div className="absolute top-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
                  Before
                </div>
                <div className="bg-accent/80 absolute top-3 right-3 rounded-lg px-2 py-1 text-xs text-white">
                  After
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slider}
                  onChange={(e) => setSlider(Number(e.target.value))}
                  className="accent-accent absolute right-4 bottom-4 left-4 z-10"
                />
              </div>

              {/* Donation badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3"
              >
                <span className="text-lg">🌟</span>
                <p className="text-xs font-medium text-emerald-700">グッズを購入すると5%が寄付に</p>
              </motion.div>

              {/* CTAs */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/book")}
                  className="rounded-xl border-2 border-[#2A9D8F] bg-white py-3 text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:bg-[#F0FDFB]"
                >
                  📖 Book
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/goods")}
                  className="rounded-xl border-2 border-[#2A9D8F] bg-white py-3 text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:bg-[#F0FDFB]"
                >
                  🎁 Goods
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] py-3 text-sm font-bold text-white transition-all duration-200 hover:shadow-lg"
                >
                  💝 シェア
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="illustrate" />
    </>
  );
}
