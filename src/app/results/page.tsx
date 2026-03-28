"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { generateShareImage } from "@/lib/generateShareImage";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ApiResult {
  photoIndex: number;
  totalScore: number;
  qualityScore?: number;
  expressionScore?: number;
  preferenceScore?: number;
  smileRating: number;
  loveRating: number;
  rareRating: number;
  aiComment: string;
}

interface DisplayResult {
  rank: number;
  dataUrl: string;
  comment: string;
  smileScore: number;
  loveScore: number;
  rareScore: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Stars({ n }: { n: number }) {
  return (
    <span className="tracking-wider">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < n ? "text-gold" : "text-gray-600"}>
          {i < n ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function ScoreRow({ item, size = "base" }: { item: DisplayResult; size?: "base" | "sm" }) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 ${textClass}`}>
      <span>笑顔度<Stars n={item.smileScore} /></span>
      <span>愛情度<Stars n={item.loveScore} /></span>
      <span>レア度<Stars n={item.rareScore} /></span>
    </div>
  );
}

function GoldParticles() {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
      const distance = 120 + Math.random() * 100;
      return { id: i, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, delay: Math.random() * 0.3 };
    })
  ).current;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
          transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
          className="absolute text-2xl"
        >
          ✨
        </motion.span>
      ))}
    </div>
  );
}

function TypewriterText({ text, speed = 50, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [charCount, setCharCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => { setCharCount(0); }, [text]);

  useEffect(() => {
    if (charCount >= text.length) { onCompleteRef.current?.(); return; }
    const timer = setTimeout(() => setCharCount((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [charCount, text.length, speed]);

  return (
    <p className="text-white text-base italic min-h-[1.5em]">
      {text.slice(0, charCount)}
      {charCount < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-white/60 ml-[1px] animate-pulse align-middle" />
      )}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Phase type
// ---------------------------------------------------------------------------
type Phase = "loading" | "countdown" | "first" | "second_third" | "cta";

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ResultsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // Data
  const [results, setResults] = useState<DisplayResult[]>([]);
  const [petName, setPetName] = useState("");

  // Phase & timing
  const [phase, setPhase] = useState<Phase>("loading");
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [showFirstPhoto, setShowFirstPhoto] = useState(false);
  const [showFirstTitle, setShowFirstTitle] = useState(false);
  const [commentDone, setCommentDone] = useState(false);
  const [showFirstScores, setShowFirstScores] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);
  const [bgColor, setBgColor] = useState("#000000");
  const [showDonationCard, setShowDonationCard] = useState(false);
  const [showCtaButtons, setShowCtaButtons] = useState(false);
  const [showGoodsBanner, setShowGoodsBanner] = useState(false);
  const [authModal, setAuthModal] = useState<string | null>(null);
  const [mode, setMode] = useState<"mock" | "live">("mock");

  const goodsBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const first = results.find((r) => r.rank === 1);
  const second = results.find((r) => r.rank === 2);
  const third = results.find((r) => r.rank === 3);

  // ----------------------------------------------------------
  // Load results from sessionStorage
  // ----------------------------------------------------------
  useEffect(() => {
    const resultsJson = sessionStorage.getItem("yolo_results");
    const previewsJson = sessionStorage.getItem("yolo_photo_previews");
    const name = sessionStorage.getItem("yolo_pet_name");

    if (!resultsJson || !previewsJson) {
      router.push("/try");
      return;
    }

    try {
      const apiResults: ApiResult[] = JSON.parse(resultsJson);
      const previews: string[] = JSON.parse(previewsJson);
      const pName = name || "ペット";
      setPetName(pName);

      // Convert API results → display results with real photos
      const displayResults: DisplayResult[] = apiResults.slice(0, 3).map((r, i) => ({
        rank: i + 1,
        dataUrl: previews[r.photoIndex] ?? previews[i] ?? previews[0] ?? "",
        comment: r.aiComment,
        smileScore: r.smileRating || 4,
        loveScore: r.loveRating || 4,
        rareScore: r.rareRating || 4,
      }));

      setResults(displayResults);

      const savedMode = sessionStorage.getItem("yolo_analysis_mode");
      setMode((savedMode as "mock" | "live") || "mock");

      setTimeout(() => setPhase("countdown"), 500);
    } catch {
      router.push("/try");
    }
  }, [router]);

  // ----------------------------------------------------------
  // Countdown
  // ----------------------------------------------------------
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdownNumber <= 0) { setPhase("first"); return; }
    const timer = setTimeout(() => setCountdownNumber((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdownNumber]);

  // ----------------------------------------------------------
  // 1st place reveal
  // ----------------------------------------------------------
  useEffect(() => {
    if (phase !== "first") return;
    setBgColor("#0D1B2A");
    const t1 = setTimeout(() => setShowFirstTitle(true), 300);
    const t2 = setTimeout(() => setShowFirstPhoto(true), 800);
    goodsBannerTimerRef.current = setTimeout(() => setShowGoodsBanner(true), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); if (goodsBannerTimerRef.current) clearTimeout(goodsBannerTimerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (!commentDone) return;
    const timer = setTimeout(() => {
      setShowFirstScores(true);
      setTimeout(() => setPhase("second_third"), 1000);
    }, 500);
    return () => clearTimeout(timer);
  }, [commentDone]);

  // ----------------------------------------------------------
  // 2nd & 3rd
  // ----------------------------------------------------------
  useEffect(() => {
    if (phase !== "second_third") return;
    const t1 = setTimeout(() => setShowSecond(true), 300);
    const t2 = setTimeout(() => setShowThird(true), 800);
    const t3 = setTimeout(() => setPhase("cta"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  // ----------------------------------------------------------
  // CTA
  // ----------------------------------------------------------
  useEffect(() => {
    if (phase !== "cta") return;
    setBgColor("#FFFFFF");
    const t1 = setTimeout(() => setShowDonationCard(true), 500);
    const t2 = setTimeout(() => setShowCtaButtons(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  // ----------------------------------------------------------
  // Share
  // ----------------------------------------------------------
  const share = useCallback(async () => {
    if (!first) return;
    try {
      // Try full image share first
      const shareBlob = await generateShareImage(
        first.dataUrl,
        petName,
        first.comment,
        { smile: first.smileScore, love: first.loveScore, rare: first.rareScore }
      );
      const shareFile = new File([shareBlob], `${petName}_bestshot.png`, { type: "image/png" });

      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          title: `${petName}のベストショット — YOLO`,
          text: `AIが選んだ${petName}のベストショット！🌟 シェアが保護犬の食事になります\n#YOLO #ベストショット`,
          files: [shareFile],
          url: "https://yolo.jp",
        });
      } else if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${petName}のベストショット — YOLO`,
          text: `AIが選んだ${petName}のベストショット！🌟\n#YOLO`,
          url: "https://yolo.jp",
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${petName}のベストショット！🌟 https://yolo.jp`);
        alert("リンクをコピーしました！");
      }
    } catch {
      // user cancelled share or error
    }
  }, [petName, first]);

  // ----------------------------------------------------------
  // Retry
  // ----------------------------------------------------------
  const handleRetry = useCallback(() => {
    sessionStorage.removeItem("yolo_results");
    sessionStorage.removeItem("yolo_analysis_mode");
    sessionStorage.removeItem("yolo_photos");
    sessionStorage.removeItem("yolo_photo_previews");
    sessionStorage.removeItem("yolo_pet_name");
    router.push("/try");
  }, [router]);

  const isDarkBg = phase === "loading" || phase === "countdown" || phase === "first" || phase === "second_third";

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <motion.div
      animate={{ backgroundColor: bgColor }}
      transition={{ duration: 3, ease: "easeInOut" }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Loading */}
      <AnimatePresence mode="wait">
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <p className="text-white/30 animate-pulse text-lg">結果を準備中...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown */}
      <AnimatePresence mode="wait">
        {phase === "countdown" && countdownNumber > 0 && (
          <motion.div
            key="countdown-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={countdownNumber}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[120px] font-bold text-white leading-none select-none"
              >
                {countdownNumber}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1st Place */}
      {(phase === "first" || phase === "second_third" || phase === "cta") && first && (
        <div className="flex flex-col items-center px-4 pt-8 pb-4 relative z-10">
          <AnimatePresence>
            {showFirstTitle && (
              <motion.h2
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-2xl font-bold text-gold mb-6 text-center"
              >
                🥇 1st Best Shot
              </motion.h2>
            )}
          </AnimatePresence>

          <div className="relative">
            <AnimatePresence>
              {showFirstPhoto && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, bounce: 0.3 }}
                  className="relative"
                >
                  <div className="rainbow-border rounded-2xl overflow-hidden w-72 h-72 md:w-96 md:h-96 mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={first.dataUrl}
                      alt={`${petName} 1st place`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <GoldParticles />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {showFirstPhoto && (
            <div className="mt-4 max-w-sm text-center">
              <TypewriterText text={first.comment} speed={50} onComplete={() => setCommentDone(true)} />
            </div>
          )}

          <AnimatePresence>
            {showFirstScores && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`mt-3 ${isDarkBg ? "text-white" : "text-gray-800"}`}
              >
                <ScoreRow item={first} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 2nd & 3rd */}
      {(phase === "second_third" || phase === "cta") && (
        <div className="flex justify-center gap-4 px-4 mt-6 relative z-10">
          <AnimatePresence>
            {showSecond && second && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex flex-col items-center"
              >
                <div className="border-4 border-gold rounded-2xl overflow-hidden w-40 h-40 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={second.dataUrl} alt={`${petName} 2nd place`} className="w-full h-full object-cover" />
                </div>
                <p className="text-gold font-bold text-sm mt-2">🥈 2nd</p>
                <p className={`text-xs mt-1 max-w-[160px] text-center italic ${isDarkBg ? "text-white/80" : "text-gray-600"}`}>
                  {second.comment}
                </p>
                <div className={`mt-1 ${isDarkBg ? "text-white/80" : "text-gray-700"}`}>
                  <ScoreRow item={second} size="sm" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showThird && third && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex flex-col items-center"
              >
                <div className="border-4 border-gray-400 rounded-2xl overflow-hidden w-36 h-36 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={third.dataUrl} alt={`${petName} 3rd place`} className="w-full h-full object-cover" />
                </div>
                <p className="text-gray-400 font-bold text-sm mt-2">🥉 3rd</p>
                <p className={`text-xs mt-1 max-w-[144px] text-center italic ${isDarkBg ? "text-white/80" : "text-gray-600"}`}>
                  {third.comment}
                </p>
                <div className={`mt-1 ${isDarkBg ? "text-white/80" : "text-gray-700"}`}>
                  <ScoreRow item={third} size="sm" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* CTA */}
      {phase === "cta" && (
        <div className="px-4 mt-8 pb-32 relative z-10 max-w-md mx-auto">
          <AnimatePresence>
            {showDonationCard && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center mb-6"
              >
                <p className="text-lg font-bold text-emerald-800 mb-1">
                  🌟 この写真をシェアすると保護犬の食事1回分になります
                </p>
                <p className="text-gray-500 text-xs">
                  YOLOでは、あなたのシェアが動物の命を救います
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCtaButtons && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                className="space-y-3"
              >
                <motion.button
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4 }}
                  onClick={share}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg shadow-lg shadow-accent/25 animate-pulse"
                >
                  💝 家族に送る
                </motion.button>

                <motion.button
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4 }}
                  onClick={share}
                  className="w-full py-3 rounded-xl border-2 border-accent bg-white text-accent font-bold"
                >
                  📤 SNSに投稿
                </motion.button>

                <motion.button
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4 }}
                  onClick={handleRetry}
                  className="w-full py-2 text-sm text-gray-400"
                >
                  🔄 もう一度選ぶ
                </motion.button>

                {!isLoggedIn && (
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link
                      href="/signup"
                      className="block w-full py-3 text-center text-accent font-bold text-base hover:underline"
                    >
                      ✨ この結果を保存する →
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Goods Banner */}
      <AnimatePresence>
        {showGoodsBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed bottom-6 left-4 right-4 z-[70] max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gold/30 p-4 flex items-center gap-3">
              <div className="text-3xl">🎁</div>
              <Link href="/goods" className="flex-1">
                <p className="font-bold text-sm">この写真でグッズを作れます</p>
                <p className="text-xs text-gray-400">アクスタ480円〜 / フィギュア2,980円〜</p>
              </Link>
              <Link href="/goods" className="px-4 py-2 bg-gold text-white text-sm font-bold rounded-xl flex-shrink-0">
                見る
              </Link>
              <button onClick={() => setShowGoodsBanner(false)} className="text-gray-300 text-lg ml-1" aria-label="閉じる">
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode indicator */}
      <div className="fixed bottom-2 right-2 z-[60]">
        <span className={`text-xs px-2 py-1 rounded-full ${
          mode === "live" ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-400"
        }`}>
          AI: {mode === "live" ? "live ✨" : "mock"}
        </span>
      </div>

      <AuthModal isOpen={!!authModal} onClose={() => setAuthModal(null)} trigger={authModal || "default"} />
    </motion.div>
  );
}
