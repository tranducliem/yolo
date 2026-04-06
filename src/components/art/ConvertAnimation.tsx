"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEP_TEXTS = [
  { at: 0, text: "写真を読み込んでいます" },
  { at: 2000, text: "スタイルを適用中" },
  { at: 4500, text: "ディテールを調整中" },
  { at: 7000, text: "仕上げています" },
  { at: 9000, text: "完成しました" },
];

interface ConvertAnimationProps {
  photo: string;
  styleName: string;
  styleFilter: string;
  onComplete: () => void;
}

export default function ConvertAnimation({
  photo,
  styleName,
  styleFilter,
  onComplete,
}: ConvertAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState(STEP_TEXTS[0].text);
  const [filterStrength, setFilterStrength] = useState(0);
  const completed = useRef(false);

  useEffect(() => {
    const start = Date.now();
    const duration = 10000;

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);

      setProgress(Math.round(t * 100));
      setFilterStrength(t);

      for (let i = STEP_TEXTS.length - 1; i >= 0; i--) {
        if (elapsed >= STEP_TEXTS[i].at) {
          setStepText(STEP_TEXTS[i].text);
          break;
        }
      }

      if (t >= 1 && !completed.current) {
        completed.current = true;
        setTimeout(onComplete, 800);
        return;
      }

      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [onComplete]);

  const isComplete = stepText === "完成しました";

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#FDF8F0] via-white to-white" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] font-medium tracking-widest text-gray-400"
        >
          CONVERTING
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 text-lg font-bold"
        >
          {styleName}スタイルに変換中
        </motion.h2>

        {/* Morphing preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 w-full max-w-[260px] overflow-hidden rounded-2xl shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt="変換中"
            className="aspect-square w-full object-cover transition-all duration-500"
            style={{
              filter: styleFilter
                .split(" ")
                .map((f) => {
                  const match = f.match(/^(\w[\w-]*)\(([^)]+)\)$/);
                  if (!match) return f;
                  const [, fn, val] = match;
                  const num = parseFloat(val);
                  if (isNaN(num)) return f;
                  const unit = val.replace(String(num), "");
                  const base = fn === "blur" ? 0 : 1;
                  const interpolated = base + (num - base) * filterStrength;
                  return `${fn}(${interpolated}${unit})`;
                })
                .join(" "),
            }}
          />
        </motion.div>

        {/* Progress */}
        <div className="mt-8 w-full max-w-[240px]">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="bg-accent h-full rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.span
                key={stepText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`text-[12px] ${isComplete ? "text-accent font-bold" : "text-gray-400"}`}
              >
                {stepText}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] text-gray-300">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
