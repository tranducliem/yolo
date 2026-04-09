"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_DURATION = 5000; // minimum ms before completing (even if API is faster)
const FAKE_PROGRESS_CAP = 88; // progress stays here until API responds

const STATUS_TEXTS = [
  { at: 0, text: "写真を読み込んでいます" },
  { at: 2000, text: "スタイルを適用中" },
  { at: 4500, text: "AIが描いています..." },
  { at: 8000, text: "仕上げています" },
];

export type ArtErrorReason = "not_configured" | "invalid_photo" | "generation_failed";

interface ConvertAnimationProps {
  photo: string;
  styleName: string;
  styleFilter: string;
  petName: string;
  styleId: string;
  onComplete: (generatedImage: string | null, errorReason: ArtErrorReason | null) => void;
}

export default function ConvertAnimation({
  photo,
  styleName,
  styleFilter,
  petName,
  styleId,
  onComplete,
}: ConvertAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_TEXTS[0].text);
  const [filterStrength, setFilterStrength] = useState(0);

  const completedRef = useRef(false);
  const apiRef = useRef<{
    done: boolean;
    imageUrl: string | null;
    errorReason: ArtErrorReason | null;
  }>({
    done: false,
    imageUrl: null,
    errorReason: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  // ── Start API call immediately on mount ──
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    async function callApi() {
      try {
        const res = await fetch("/api/art/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo, petName, styleId }),
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          success?: boolean;
          generatedImageUrl?: string | null;
          errorReason?: ArtErrorReason;
        };
        apiRef.current = {
          done: true,
          imageUrl: data.success ? (data.generatedImageUrl ?? null) : null,
          errorReason: data.errorReason ?? null,
        };
      } catch (e) {
        if (!controller.signal.aborted) {
          console.error("[ConvertAnimation] API call failed:", e);
        }
        apiRef.current = { done: true, imageUrl: null, errorReason: "generation_failed" };
      }
    }

    callApi();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animation loop (rAF) ──
  useEffect(() => {
    const start = Date.now();
    let raf: number;

    const tick = () => {
      if (completedRef.current) return;

      const elapsed = Date.now() - start;
      const pastMin = elapsed >= MIN_DURATION;

      // Completion condition: min time elapsed AND API responded
      if (pastMin && apiRef.current.done) {
        setProgress(100);
        setStatusText("完成しました ✨");
        setFilterStrength(1);
        completedRef.current = true;
        setTimeout(() => onComplete(apiRef.current.imageUrl, apiRef.current.errorReason), 800);
        return;
      }

      // Update status text
      for (let i = STATUS_TEXTS.length - 1; i >= 0; i--) {
        if (elapsed >= STATUS_TEXTS[i].at) {
          setStatusText(STATUS_TEXTS[i].text);
          break;
        }
      }

      if (pastMin) {
        // Still waiting for API after min duration
        setProgress(FAKE_PROGRESS_CAP);
        setFilterStrength(FAKE_PROGRESS_CAP / 100);
      } else {
        // Animate progress toward FAKE_PROGRESS_CAP
        const t = elapsed / MIN_DURATION;
        setProgress(Math.round(t * FAKE_PROGRESS_CAP));
        setFilterStrength(t * (FAKE_PROGRESS_CAP / 100));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const isComplete = statusText.includes("完成しました");

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#FDF8F0] via-white to-white" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] font-medium tracking-widest text-gray-400"
        >
          GENERATING
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 text-lg font-bold"
        >
          {styleName}スタイルに変換中
        </motion.h2>

        {/* Morphing preview — applies filter gradually */}
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
              filter: interpolateFilter(styleFilter, filterStrength),
            }}
          />
        </motion.div>

        {/* Progress bar */}
        <div className="mt-8 w-full max-w-[240px]">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="bg-accent h-full rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`text-[12px] ${isComplete ? "text-accent font-bold" : "text-gray-400"}`}
              >
                {statusText}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] text-gray-300">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interpolate CSS filter values from identity (1) toward target value
function interpolateFilter(filter: string, strength: number): string {
  if (!filter) return "";
  return filter
    .split(" ")
    .map((f) => {
      const match = f.match(/^([\w-]+)\(([^)]+)\)$/);
      if (!match) return f;
      const [, fn, val] = match;
      const num = parseFloat(val);
      if (isNaN(num)) return f;
      const unit = val.replace(String(num), "");
      const identity = fn === "blur" ? 0 : 1;
      const interpolated = identity + (num - identity) * strength;
      return `${fn}(${interpolated}${unit})`;
    })
    .join(" ");
}
