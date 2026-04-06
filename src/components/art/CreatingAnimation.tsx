"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { STYLE_FILTERS } from "@/lib/art-styles";

type Props = {
  photoUrl: string;
  styleId: string;
  petName: string;
  styleName: string;
  onComplete: () => void;
  apiDone: boolean;
};

const TOTAL_DURATION = 18000; // 18 seconds

type Phase = {
  label: string;
  emoji: string;
  filter: (styleFilter: string) => string;
};

const PHASES: Phase[] = [
  {
    label: "輪郭を描いています...",
    emoji: "✏️",
    filter: () => "saturate(0)",
  },
  {
    label: "色を塗っています...",
    emoji: "🎨",
    filter: (sf) => sf,
  },
  {
    label: "仕上げています...",
    emoji: "✨",
    filter: (sf) => sf,
  },
  {
    label: "完成！",
    emoji: "🎉",
    filter: (sf) => sf,
  },
];

export default function CreatingAnimation({
  photoUrl,
  styleId,
  petName,
  styleName,
  onComplete,
  apiDone,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const startTime = useRef(0);
  const rafRef = useRef<number>(0);
  const completedRef = useRef(false);

  const styleFilter = STYLE_FILTERS[styleId] || "saturate(1.3) contrast(1.2)";

  useEffect(() => {
    startTime.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      let pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);

      // If API isn't done yet and we're at 95%, hold
      if (!apiDone && pct >= 95) {
        pct = 95;
      }

      setProgress(pct);

      // Update phase
      if (pct < 30) setPhaseIndex(0);
      else if (pct < 70) setPhaseIndex(1);
      else if (pct < 95) setPhaseIndex(2);
      else setPhaseIndex(3);

      if (pct >= 100 && !completedRef.current) {
        completedRef.current = true;
        setFlash(true);
        setTimeout(() => {
          setFlash(false);
          setTimeout(onComplete, 1500);
        }, 400);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [apiDone, onComplete]);

  // Compute current filter based on progress
  const getCurrentFilter = () => {
    if (progress < 30) {
      const t = progress / 30;
      return `saturate(${1 - t}) contrast(${1 + t * 0.2})`;
    } else if (progress < 70) {
      const t = (progress - 30) / 40;
      // Transition from desaturated to style filter
      return `saturate(${t * 1.5}) contrast(${1 + t * 0.2})`;
    } else {
      return styleFilter;
    }
  };

  const phase = PHASES[phaseIndex];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-[#f0fdfb] px-4 py-8">
      {/* Title */}
      <p className="mb-6 text-center text-lg font-bold text-gray-800">
        🎨 {petName}を{styleName}に変換しています...
      </p>

      {/* Main image area */}
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl">
        <img
          src={photoUrl}
          alt={petName}
          className="h-full w-full object-cover transition-all duration-500"
          style={{ filter: getCurrentFilter() }}
        />

        {/* Flash effect */}
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white"
          />
        )}
      </div>

      {/* Phase text */}
      <motion.p
        key={phaseIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center text-base font-medium text-gray-700"
      >
        {phase.emoji} {phase.label}
      </motion.p>

      {/* Progress bar */}
      <div className="mt-6 w-full max-w-sm">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="relative h-full rounded-full bg-[#2A9D8F]"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center text-[8px]">
              ✨
            </span>
          </motion.div>
        </div>
        <p className="mt-1 text-right text-xs text-gray-400">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
