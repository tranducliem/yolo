"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionData, getProcessedPhotos } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";

interface ResultItem {
  rank: number;
  dataUrl: string;
  comment: string;
  smileScore: number;
  loveScore: number;
  rareScore: number;
}

const STEP_PHASES: {
  startSec: number;
  endSec: number;
  text: string;
  isFinal: boolean;
}[] = [
  { startSec: 0, endSec: 4, text: "📸 画質をチェックしています...", isFinal: false },
  { startSec: 4, endSec: 8, text: "😊 表情を分析しています...", isFinal: false },
  { startSec: 8, endSec: 12, text: "🏆 ベストショットを選んでいます...", isFinal: false },
  { startSec: 12, endSec: 14, text: "✨ もう少し...", isFinal: false },
  { startSec: 14, endSec: 15, text: "🎉 見つかりました！", isFinal: true },
];

const AI_COMMENTS = [
  "窓辺の光がモカの瞳をキラキラにしています",
  "この無邪気な笑顔は見ているだけで幸せになれます",
  "お散歩中の凛とした横顔がとても美しい一枚",
  "ふわふわの毛並みが夕陽に輝いて最高のショットです",
  "カメラ目線のこの表情、完璧なタイミングです",
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFallbackResults(photoCount: number, petName: string) {
  const comments = [
    `窓辺の光が${petName}の瞳をキラキラにしています`,
    `この無邪気な笑顔は見ているだけで幸せになれます`,
    `お散歩中の凛とした横顔がとても美しい一枚`,
    `ふわふわの毛並みが夕陽に輝いて最高のショットです`,
    `カメラ目線のこの表情、完璧なタイミングです`,
  ];
  const indices = Array.from({ length: photoCount }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((photoIndex, rank) => ({
    photoIndex,
    totalScore: 97 - rank * 3 + Math.floor(Math.random() * 3),
    smileRating: rank === 0 ? randInt(4, 5) : randInt(3, 4),
    loveRating: rank === 0 ? randInt(4, 5) : randInt(3, 4),
    rareRating: rank === 0 ? randInt(4, 5) : randInt(3, 4),
    aiComment: comments[rank] || comments[0],
  }));
}

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

export default function AnalyzingPage() {
  const router = useRouter();
  useAuth();
  const [progress, setProgress] = useState(0);
  const [petName, setPetName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [fadingToWhite, setFadingToWhite] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [apiResults, setApiResults] = useState<any[] | null>(null);
  const [apiMode, setApiMode] = useState<'mock' | 'live'>('mock');
  const started = useRef(false);
  const particles = useMemo(() => generateParticles(), []);

  const currentPhaseIndex = STEP_PHASES.findIndex(
    (p) => elapsedSec >= p.startSec && elapsedSec < p.endSec
  );
  const activePhase =
    currentPhaseIndex !== -1
      ? STEP_PHASES[currentPhaseIndex]
      : STEP_PHASES[STEP_PHASES.length - 1];

  // Progress timer: 0 to 100 over 15 seconds
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const data = getSessionData();
    if (!data) {
      router.push("/try");
      return;
    }
    setPetName(data.petName);
    setImages(data.images);

    const duration = 15000;
    const startTime = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      const sec = Math.min(15, elapsed / 1000);
      setProgress(p);
      setElapsedSec(sec);
      if (p >= 100) {
        clearInterval(iv);
        setDone(true);
      }
    }, 50);
    return () => clearInterval(iv);
  }, [router]);

  // Call the API in parallel with the animation
  useEffect(() => {
    const data = getSessionData();
    const processed = getProcessedPhotos();
    if (!data || !processed) return;

    const callApi = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: processed, petName: data.petName }),
        });
        const result = await response.json();
        if (result.success) {
          setApiResults(result.results);
          setApiMode(result.mode);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('API call failed, using mock results:', error);
        // Generate fallback mock results
        const fallbackResults = generateFallbackResults(data.images.length, data.petName);
        setApiResults(fallbackResults);
        setApiMode('mock');
      }
      setApiDone(true);
    };

    callApi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If API completes and animation is past 80%, accelerate to 100%
  useEffect(() => {
    if (apiDone && !done && progress >= 80) {
      // Force completion
      setProgress(100);
      setElapsedSec(15);
      setDone(true);
    }
  }, [apiDone, done, progress]);

  // When BOTH animation is done AND API has responded, save and navigate
  useEffect(() => {
    if (!done || !apiDone || !apiResults) return;
    const data = getSessionData();
    if (!data) return;

    // Convert API results (with photoIndex) to ResultItem format for /results page
    const top3 = apiResults.slice(0, 3).map((result: any, i: number) => ({
      rank: i + 1,
      dataUrl: data.images[result.photoIndex] || data.images[i] || data.images[0],
      comment: result.aiComment,
      smileScore: result.smileRating || randInt(3, 5),
      loveScore: result.loveRating || randInt(3, 5),
      rareScore: result.rareRating || randInt(3, 5),
    }));

    sessionStorage.setItem(
      "yolo_results",
      JSON.stringify({ petName: data.petName, results: top3 })
    );
    sessionStorage.setItem("yolo_mode", apiMode);
    sessionStorage.setItem("yolo_pet_name", data.petName);

    // Background fade and navigate
    const fadeTimer = setTimeout(() => {
      setFadingToWhite(true);
    }, 0);
    const navTimer = setTimeout(() => {
      router.push("/results");
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [done, apiDone, apiResults, apiMode, router]);

  const tripled = useMemo(() => {
    if (images.length === 0) return [];
    return [...images, ...images, ...images];
  }, [images]);

  const totalMarqueeWidth = tripled.length * 72;

  const r = 80;
  const circumference = 2 * Math.PI * r;

  const filterCycle = [
    "none",
    "sepia(1)",
    "contrast(1.5)",
    "brightness(1.4)",
    "none",
  ];

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden"
      animate={{
        backgroundColor: fadingToWhite ? "#ffffff" : "#0D1B2A",
      }}
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
            opacity: [
              p.opacity,
              p.opacity * 1.5,
              p.opacity * 0.6,
              p.opacity * 1.2,
              p.opacity,
            ],
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
      {images.length > 0 && (
        <div className="w-full max-w-md mb-8 overflow-hidden relative h-20 z-10">
          <motion.div
            className="flex gap-2 absolute top-0 left-0"
            animate={{ x: [0, -totalMarqueeWidth / 3] }}
            transition={{
              duration: images.length * 3,
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

      {/* Circular progress (180px diameter) */}
      <div className="relative mb-8 z-10" style={{ width: 180, height: 180 }}>
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="-rotate-90"
        >
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="6"
          />
          <motion.circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke="#2A9D8F"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 15, ease: "easeInOut" }}
          />
        </svg>

        {/* Orbiting teal glow dot */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: 0,
            height: 0,
            top: "50%",
            left: "50%",
            transformOrigin: "center center",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#2A9D8F",
              boxShadow: "0 0 14px 6px rgba(42,157,143,0.6)",
              top: -(r + 5),
              left: -5,
            }}
          />
        </motion.div>

        {/* Center percentage number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">
            {Math.round(progress)}
          </span>
        </div>
      </div>

      {/* Step text with typewriter animation */}
      <div className="z-10 min-h-[3rem] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase.text}
            initial={{ opacity: 0, y: 10 }}
            animate={
              activePhase.isFinal
                ? {
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.2, 1],
                    color: "#D4A843",
                  }
                : { opacity: 1, y: 0, color: "#ffffff" }
            }
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.5,
              scale: { duration: 0.6, ease: "easeInOut" },
            }}
            className="text-lg md:text-xl font-medium text-center"
          >
            <TypewriterText text={activePhase.text} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation indicator after completion */}
      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center z-10"
        >
          <p className="text-white/60 text-sm animate-pulse">
            結果ページに移動します...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
