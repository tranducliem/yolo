"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ArtErrorReason } from "@/components/art/ConvertAnimation";

interface ArtResultProps {
  photo: string;
  generatedImage: string | null; // AI-generated image; null = use CSS filter fallback
  errorReason: ArtErrorReason | null;
  styleFilter: string;
  styleName: string;
  styleEmoji: string;
  onRetry: () => void;
}

const ERROR_MESSAGES: Record<ArtErrorReason, string> = {
  not_configured: "AI生成サービスが未設定のため、フィルター表示中です",
  invalid_photo: "写真の形式が読めなかったため、フィルター表示中です",
  generation_failed: "AI生成に失敗しました。フィルターで表示しています",
};

export default function ArtResult({
  photo,
  generatedImage,
  errorReason,
  styleFilter,
  styleName,
  styleEmoji,
  onRetry,
}: ArtResultProps) {
  const [slider, setSlider] = useState(50);
  const [showSparkles, setShowSparkles] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasRealImage = !!generatedImage;

  useEffect(() => {
    const t = setTimeout(() => setShowSparkles(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = useCallback(() => {
    // If we have a real generated image, download it directly
    if (generatedImage) {
      const link = document.createElement("a");
      link.download = `yolo-art-${styleName}.jpg`;
      link.href = generatedImage;
      link.click();
      return;
    }

    // Fallback: use canvas to apply CSS filter to original
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.filter = styleFilter;
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `yolo-art-${styleName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = photo;
  }, [generatedImage, photo, styleFilter, styleName]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `YOLOイラスト - ${styleName}スタイル`,
          text: `うちの子を${styleName}スタイルでイラスト化しました！`,
          url: "https://yolo.jp/art",
        });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(
        `うちの子を${styleName}スタイルでイラスト化しました！ https://yolo.jp/art`,
      );
      alert("リンクをコピーしました");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-white">
      {showSparkles && <SparkleOverlay />}
      <canvas ref={canvasRef} className="hidden" />

      <div className="px-5 pt-8 pb-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-[11px] font-medium tracking-widest text-gray-300">COMPLETE</p>
          <h2 className="mt-1 text-lg font-bold">
            {styleEmoji} {styleName}スタイル
          </h2>
          {hasRealImage && <p className="mt-1 text-[11px] text-gray-400">AI生成アート</p>}
        </motion.div>

        {/* Fallback notice — shown when AI generation failed */}
        {!hasRealImage && errorReason && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5"
          >
            <p className="text-center text-[11px] leading-relaxed text-amber-700">
              ⚠️ {ERROR_MESSAGES[errorReason]}
            </p>
          </motion.div>
        )}

        {/* Before / After comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative mx-auto mt-6 max-w-sm overflow-hidden rounded-2xl shadow-lg"
          style={{ aspectRatio: "1" }}
        >
          {/* Before — original photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Before" className="absolute inset-0 h-full w-full object-cover" />

          {/* After — real generated image or CSS filter fallback */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
            {hasRealImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={generatedImage}
                alt={`${styleName}スタイル`}
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={`${styleName}スタイル`}
                className="h-full w-full object-cover"
                style={{ filter: styleFilter }}
              />
            )}
          </div>

          {/* Divider handle */}
          <div className="pointer-events-none absolute inset-y-0" style={{ left: `${slider}%` }}>
            <div className="h-full w-0.5 bg-white shadow-lg" />
            <div className="text-accent absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-lg">
              ↔
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-medium text-white">
            Before
          </div>
          <div className="bg-accent/80 absolute top-3 right-3 rounded-lg px-2 py-1 text-[10px] font-medium text-white">
            After
          </div>

          {/* Range slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            className="accent-accent absolute right-4 bottom-4 left-4 z-10"
          />
        </motion.div>

        {/* Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-8 max-w-sm"
        >
          <p className="text-center text-[11px] font-medium tracking-widest text-gray-400">
            MAKE IT REAL
          </p>
          <h3 className="mt-1 text-center text-[15px] font-bold">イラストをグッズにする</h3>

          <div className="mt-4 space-y-2.5">
            <ProductCard title="デジタルダウンロード" desc="高画質PNG / PDF" price="¥480" accent />
            <ProductCard
              title="キャンバスプリント"
              desc="A4サイズ・木製フレーム付き"
              price="¥3,980"
            />
            <ProductCard title="アクリルスタンド" desc="卓上サイズ (10cm)" price="¥1,980" />

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
              <span className="text-lg">🌟</span>
              <p className="text-[11px] font-medium text-emerald-700">
                グッズ購入の5%が保護動物の支援に寄付されます
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mx-auto mt-8 max-w-sm space-y-2.5"
        >
          <button
            type="button"
            onClick={handleDownload}
            className="bg-accent shadow-accent/20 h-12 w-full rounded-full text-[14px] font-bold text-white shadow-lg transition-all active:scale-[0.97]"
          >
            無料ダウンロード
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="h-11 w-full rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300"
          >
            SNSにシェアする
          </button>
        </motion.div>

        {/* Secondary links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <Link href="/letter" className="text-accent text-[12px] font-medium">
            この子からの手紙を受け取る →
          </Link>
          <button type="button" onClick={onRetry} className="text-[12px] text-gray-400">
            別のスタイルで試す
          </button>
        </motion.div>

        <p className="mt-6 text-center text-[10px] text-gray-300">
          写真はAI処理のみに使用され、サーバーに保存されません
        </p>
      </div>
    </div>
  );
}

/* ── Product card ── */
function ProductCard({
  title,
  desc,
  price,
  accent,
}: {
  title: string;
  desc: string;
  price: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 ${
        accent ? "border-accent/20 bg-accent/[0.03]" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex-1">
        <p className="text-[13px] font-bold">{title}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">{desc}</p>
      </div>
      <div className="ml-4 text-right">
        <p className="text-accent text-[14px] font-bold">{price}</p>
      </div>
    </div>
  );
}

/* ── Sparkle overlay ── */
function SparkleOverlay() {
  const [particles] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
      delay: Math.random() * 1.5,
      size: 3 + Math.random() * 4,
    })),
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-300"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          initial={{ opacity: 0.8, scale: 0 }}
          animate={{ opacity: 0, scale: 1.5, y: -20 }}
          transition={{ duration: 2, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
