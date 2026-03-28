"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

function generateParticles(): Particle[] {
  if (typeof window === "undefined") return []; // Skip on SSR to avoid hydration mismatch
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.3 + 0.3,
    duration: Math.random() * 12 + 8,
    delay: Math.random() * 5,
    color: i % 2 === 0 ? "#ffffff" : "#2A9D8F",
  }));
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- timer-driven state update
    setDisplayed("");
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <>{displayed}</>;
}

const STEP_PHASES = [
  { at: 0, text: "📸 画質をチェックしています..." },
  { at: 4000, text: "😊 表情を分析しています..." },
  { at: 8000, text: "🏆 ベストショットを選んでいます..." },
  { at: 12000, text: "✨ もう少し..." },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [petName, setPetName] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState(STEP_PHASES[0].text);
  const [isComplete, setIsComplete] = useState(false);
  const [fadingToWhite, setFadingToWhite] = useState(false);
  const apiDone = useRef(false);
  const animDone = useRef(false);
  const navigating = useRef(false);
  const started = useRef(false);
  const [particles] = useState(() => generateParticles());

  const checkAndNavigate = () => {
    if (apiDone.current && animDone.current && !navigating.current) {
      navigating.current = true;
      setIsComplete(true);
      setStepText("🎉 見つかりました！");
      setProgress(100);
      setTimeout(() => {
        setFadingToWhite(true);
        setTimeout(() => router.push("/results"), 1000);
      }, 500);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const name = sessionStorage.getItem("yolo_pet_name");
    if (!name) { router.push("/try"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing from sessionStorage
    setPetName(name);

    // Load previews for marquee display
    try {
      const previewsJson = sessionStorage.getItem("yolo_photo_previews");
      if (previewsJson) setPreviews(JSON.parse(previewsJson));
    } catch { /* ignore */ }

    // === API呼び出し（バックグラウンド）===
    const callApi = async () => {
      const photosJson = sessionStorage.getItem("yolo_photos");
      if (!photosJson) { router.push("/try"); return; }

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photos: JSON.parse(photosJson),
            petName: name,
          }),
        });
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem("yolo_results", JSON.stringify(data.results));
          sessionStorage.setItem("yolo_analysis_mode", data.mode);
        }
      } catch (e) {
        console.error("API error:", e);
        // フォールバック
        sessionStorage.setItem("yolo_results", JSON.stringify([
          { photoIndex: 0, totalScore: 97, qualityScore: 92, expressionScore: 98, preferenceScore: 99, smileRating: 4, loveRating: 5, rareRating: 4, aiComment: `${name}の最高の瞬間です` },
          { photoIndex: 1, totalScore: 93, qualityScore: 90, expressionScore: 95, preferenceScore: 94, smileRating: 5, loveRating: 4, rareRating: 3, aiComment: "この笑顔がたまりません" },
          { photoIndex: 2, totalScore: 91, qualityScore: 95, expressionScore: 88, preferenceScore: 90, smileRating: 3, loveRating: 4, rareRating: 5, aiComment: "美しい一枚です" },
        ]));
        sessionStorage.setItem("yolo_analysis_mode", "mock");
      }
      apiDone.current = true;
      checkAndNavigate();
    };
    callApi();

    // === アニメーション（15秒）===
    const duration = 15000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      let p = Math.min(elapsed / duration, 1);

      // API完了後は加速
      if (apiDone.current && p < 0.95) p = Math.min(p + 0.05, 0.98);

      setProgress(Math.round(p * 100));

      // ステップテキスト更新
      for (let i = STEP_PHASES.length - 1; i >= 0; i--) {
        if (elapsed >= STEP_PHASES[i].at) { setStepText(STEP_PHASES[i].text); break; }
      }

      if (p >= 1) {
        animDone.current = true;
        checkAndNavigate();
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tripled = useMemo(() => {
    if (previews.length === 0) return [];
    return [...previews, ...previews, ...previews];
  }, [previews]);

  const totalMarqueeWidth = tripled.length * 72;
  const r = 80;
  const circumference = 2 * Math.PI * r;

  const filterCycle = ["none", "sepia(1)", "contrast(1.5)", "brightness(1.4)", "none"];

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden"
      animate={{ backgroundColor: fadingToWhite ? "#ffffff" : "#0D1B2A" }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.6, p.opacity * 1.2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* Pet name display */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-xl md:text-2xl font-bold text-center mb-6 text-white z-10"
      >
        🔍 {petName}のベストショットを探しています...
      </motion.h2>

      {/* Photo flow (marquee style) */}
      {previews.length > 0 && (
        <div className="w-full max-w-md mb-8 overflow-hidden relative h-20 z-10">
          <motion.div
            className="flex gap-2 absolute top-0 left-0"
            animate={{ x: [0, -totalMarqueeWidth / 3] }}
            transition={{
              duration: previews.length * 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {tripled.map((img, i) => {
              const filterIdx = i % filterCycle.length;
              return (
                <motion.div
                  key={i}
                  className="flex-shrink-0"
                  animate={{
                    filter: [
                      filterCycle[filterIdx],
                      filterCycle[(filterIdx + 1) % filterCycle.length],
                      filterCycle[(filterIdx + 2) % filterCycle.length],
                      filterCycle[(filterIdx + 3) % filterCycle.length],
                      filterCycle[filterIdx],
                    ],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Circular progress */}
      <div className="relative mb-8 z-10" style={{ width: 180, height: 180 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
          <circle
            cx="90" cy="90" r={r}
            fill="none"
            stroke="#2A9D8F"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
          />
        </svg>

        {/* Orbiting glow dot */}
        <motion.div
          className="absolute pointer-events-none"
          style={{ width: 0, height: 0, top: "50%", left: "50%", transformOrigin: "center center" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 10, height: 10,
              backgroundColor: "#2A9D8F",
              boxShadow: "0 0 14px 6px rgba(42,157,143,0.6)",
              top: -(r + 5),
              left: -5,
            }}
          />
        </motion.div>

        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">{progress}</span>
        </div>
      </div>

      {/* Step text */}
      <div className="z-10 min-h-[3rem] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepText}
            initial={{ opacity: 0, y: 10 }}
            animate={
              isComplete
                ? { opacity: 1, y: 0, scale: [1, 1.2, 1], color: "#D4A843" }
                : { opacity: 1, y: 0, color: "#ffffff" }
            }
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, scale: { duration: 0.6, ease: "easeInOut" } }}
            className="text-lg md:text-xl font-medium text-center"
          >
            <TypewriterText text={stepText} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation indicator */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center z-10"
        >
          <p className="text-white/60 text-sm animate-pulse">結果ページに移動します...</p>
        </motion.div>
      )}
    </motion.div>
  );
}
