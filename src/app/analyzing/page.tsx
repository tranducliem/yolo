"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSessionData } from "@/lib/store";

const STEPS = [
  { end: 33, icon: "📸", text: "画質をチェックしています..." },
  { end: 66, icon: "😊", text: "表情を分析しています..." },
  { end: 100, icon: "🏆", text: "ベストショットを選んでいます..." },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [petName, setPetName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  const step = STEPS.find((s) => progress < s.end) || STEPS[2];

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const data = getSessionData();
    if (!data) { router.push("/try"); return; }
    setPetName(data.petName);
    setImages(data.images);

    const dur = 15000, start = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / dur) * 100);
      setProgress(p);
      if (p >= 100) { clearInterval(iv); setDone(true); }
    }, 50);
    return () => clearInterval(iv);
  }, [router]);

  useEffect(() => {
    if (!done) return;
    const data = getSessionData();
    if (!data) return;
    const comments = [
      "夕陽に照らされた毛並みが金色に輝く最高の1枚",
      "キュートな首かしげポーズが最高に愛らしい",
      "自然光の中でリラックスした表情が魅力的",
    ];
    const top3 = [0, 1, 2].map((i) => ({
      rank: i + 1,
      dataUrl: data.images[Math.min(i, data.images.length - 1)],
      comment: comments[i],
      smileScore: [4, 4, 3][i],
      loveScore: [5, 4, 4][i],
      rareScore: [4, 3, 3][i],
    }));
    sessionStorage.setItem("tomoni_results", JSON.stringify({ petName: data.petName, results: top3 }));
    const t = setTimeout(() => router.push("/results"), 2000);
    return () => clearTimeout(t);
  }, [done, router]);

  const r = 60, c = 2 * Math.PI * r, off = c - (progress / 100) * c;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-white to-[#F0FDFB]">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-xl md:text-2xl font-bold text-center mb-6">
        {done ? "見つかりました！ 🎉" : `${petName}のベストショットを探しています...`}
      </motion.h2>

      {images.length > 0 && (
        <div className="w-full max-w-sm mb-8 overflow-hidden">
          <motion.div animate={done ? {} : { x: [0, -images.length * 80] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="flex gap-2">
            {[...images, ...images].map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 opacity-60" />
            ))}
          </motion.div>
        </div>
      )}

      <div className="relative mb-6">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="70" cy="70" r={r} fill="none" stroke="#2A9D8F" strokeWidth="8"
            strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-100" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-accent">{Math.round(progress)}%</span>
        </div>
      </div>

      <motion.p key={step.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent font-medium">
        {step.icon} {step.text}
      </motion.p>
    </div>
  );
}
