"use client";

import { useState } from "react";
import {
  ART_STYLES,
  STYLE_CATEGORIES,
  FREE_STYLE_COUNT,
  TOTAL_STYLE_COUNT,
} from "@/lib/art-styles";
import type { ArtStyleCategory } from "@/types/art.types";
import StyleCard from "./StyleCard";

type Props = {
  selectedStyleId: string | null;
  onStyleSelect: (id: string) => void;
};

export default function StyleGrid({ selectedStyleId, onStyleSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<ArtStyleCategory>("popular");

  const filteredStyles = ART_STYLES.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">スタイルを選んでください</h2>
        <p className="text-[13px] text-gray-500">{FREE_STYLE_COUNT}種類が無料で体験できます</p>
      </div>

      {/* Category tabs */}
      <div className="hide-scrollbar sticky top-[80px] z-10 -mx-4 flex gap-2 overflow-x-auto bg-white px-4 pb-2">
        {STYLE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.id ? "bg-[#2A9D8F] text-white" : "bg-gray-100 text-gray-600"
            } `}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredStyles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={selectedStyleId === style.id}
            onSelect={onStyleSelect}
          />
        ))}
      </div>

      {/* YOLO+ promo */}
      <div className="mt-4 rounded-xl bg-[#f0fdfb] p-4">
        <p className="text-sm font-bold text-[#2A9D8F]">
          🌟 YOLO+で全{TOTAL_STYLE_COUNT}スタイルが使い放題
        </p>
        <p className="mt-1 text-[13px] text-gray-500">¥480/月 — 7日間無料体験</p>
      </div>
    </div>
  );
}
