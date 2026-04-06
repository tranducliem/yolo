"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ART_STYLES, STYLE_FILTERS } from "@/lib/art-styles";

interface StyleSelectorProps {
  photo: string;
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StyleSelector({
  photo,
  selected,
  onSelect,
  onNext,
  onBack,
}: StyleSelectorProps) {
  const [premiumTapped, setPremiumTapped] = useState<string | null>(null);

  const handleTap = (id: string, premium: boolean) => {
    if (premium) {
      setPremiumTapped(id);
      return;
    }
    setPremiumTapped(null);
    onSelect(id);
  };

  return (
    <div className="px-5 pt-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="text-center text-lg font-bold">スタイルを選択</h2>
        <p className="mt-1 text-center text-[12px] text-gray-400">
          あなたの写真でプレビューしています
        </p>
      </motion.div>

      {/* ── 2列グリッド ── */}
      <div className="mx-auto mt-5 max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          {ART_STYLES.map(
            (s: { id: string; name: string; emoji: string; isFree: boolean }, i: number) => {
              const isSelected = selected === s.id;
              const isPremium = !s.isFree;
              const filter = STYLE_FILTERS[s.id] || "";
              const showPremiumMsg = premiumTapped === s.id;

              return (
                <motion.button
                  key={s.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleTap(s.id, isPremium)}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-accent shadow-md"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  {/* ユーザーの写真 + CSSフィルター */}
                  <div className="relative aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={s.name}
                      className="h-full w-full object-cover"
                      style={{ filter }}
                    />

                    {/* Premium lock overlay */}
                    {isPremium && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="text-2xl">🔒</span>
                      </div>
                    )}

                    {/* Selected check */}
                    {isSelected && !isPremium && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-accent absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] text-white shadow"
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="bg-white py-2 text-center">
                    <p
                      className={`text-[12px] font-medium ${
                        isSelected ? "text-accent" : "text-gray-600"
                      }`}
                    >
                      {s.emoji} {s.name}
                    </p>
                    {isPremium && <p className="text-[10px] text-gray-400">YOLO+</p>}
                  </div>

                  {/* Premium tap message */}
                  {showPremiumMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-navy/80 absolute inset-0 flex flex-col items-center justify-center p-3"
                    >
                      <p className="text-center text-[12px] font-bold text-white">
                        YOLO+ で利用可能
                      </p>
                      <p className="mt-1 text-center text-[10px] text-white/70">
                        ¥480/月 · 7日間無料
                      </p>
                    </motion.div>
                  )}
                </motion.button>
              );
            },
          )}
        </div>
      </div>

      {/* ── Buttons ── */}
      <div className="mx-auto mt-6 flex max-w-sm gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-full border border-gray-200 px-5 text-[13px] font-medium text-gray-400 transition-colors hover:border-gray-300"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="bg-accent h-12 flex-1 rounded-full text-[15px] font-bold text-white transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
