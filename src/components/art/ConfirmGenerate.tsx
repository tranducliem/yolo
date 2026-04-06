"use client";

import { motion } from "framer-motion";

interface ConfirmGenerateProps {
  photo: string;
  petName: string;
  styleName: string;
  styleEmoji: string;
  styleFilter: string;
  onGenerate: () => void;
  onBack: () => void;
}

export default function ConfirmGenerate({
  photo,
  petName,
  styleName,
  styleEmoji,
  styleFilter,
  onGenerate,
  onBack,
}: ConfirmGenerateProps) {
  return (
    <div className="px-5 pt-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="text-center text-lg font-bold">この内容で作成します</h2>
      </motion.div>

      <div className="mx-auto mt-6 max-w-sm">
        {/* ── Pill ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <span className="bg-accent/10 text-accent inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold">
            🐾 {petName} × {styleEmoji} {styleName}
          </span>
        </motion.div>

        {/* ── Before / After ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-5 grid grid-cols-2 gap-3"
        >
          {/* Before */}
          <div className="overflow-hidden rounded-xl border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="元の写真" className="aspect-square w-full object-cover" />
            <p className="bg-white py-1.5 text-center text-[11px] font-medium text-gray-400">
              元の写真
            </p>
          </div>

          {/* After preview */}
          <div className="border-accent/20 overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`${styleName}プレビュー`}
              className="aspect-square w-full object-cover"
              style={{ filter: styleFilter }}
            />
            <p className="bg-accent/5 text-accent py-1.5 text-center text-[11px] font-medium">
              {styleEmoji} {styleName}
            </p>
          </div>
        </motion.div>

        {/* ── Generate button ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={onGenerate}
            className="bg-accent shadow-accent/20 h-12 w-full rounded-full text-[15px] font-bold text-white shadow-lg transition-all active:scale-[0.97]"
          >
            ✨ アートを作成する
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">完全無料 · 登録不要</p>
        </motion.div>

        <div className="mt-4 text-center">
          <button type="button" onClick={onBack} className="text-[12px] text-gray-400">
            ← スタイルを変更する
          </button>
        </div>
      </div>
    </div>
  );
}
