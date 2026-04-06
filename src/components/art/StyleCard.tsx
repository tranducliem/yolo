"use client";

import { motion } from "framer-motion";
import type { ArtStyle } from "@/types/art.types";

type Props = {
  style: ArtStyle;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export default function StyleCard({ style, isSelected, onSelect }: Props) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(style.id)}
      className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${isSelected ? "scale-[1.02] border-[#2A9D8F] shadow-lg" : "border-gray-200"} `}
    >
      {/* Badge */}
      {style.badgeText && (
        <div className="absolute top-2 left-2 z-10 rounded-full bg-[#2A9D8F] px-2 py-0.5 text-[10px] font-medium text-white">
          {style.badgeText}
        </div>
      )}

      {/* Lock icon for paid styles */}
      {!style.isFree && (
        <div className="absolute top-2 right-2 z-10 rounded-bl-lg bg-black/50 px-2 py-1 text-xs text-white">
          🔒
        </div>
      )}

      {/* Sample area */}
      <div className={`aspect-square ${style.bgColor} flex flex-col items-center justify-center`}>
        <span className="text-4xl">{style.emoji}</span>
        <span className="mt-2 text-sm font-medium text-gray-700">{style.name}</span>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-1">
          <span className="text-sm">{style.emoji}</span>
          <span className="text-sm font-medium text-gray-800">{style.name}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{style.description}</p>
        {!style.isFree && <p className="mt-1 text-[10px] text-gray-400">YOLO+で解放</p>}
      </div>
    </motion.div>
  );
}
