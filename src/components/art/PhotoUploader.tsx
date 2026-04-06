"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ensureBrowserCompatible, validateImage } from "@/lib/image";

interface PhotoUploaderProps {
  photo: string | null;
  petName: string;
  onSelectPhoto: (dataUrl: string) => void;
  onChangeName: (name: string) => void;
  onNext: () => void;
}

export default function PhotoUploader({
  photo,
  petName,
  onSelectPhoto,
  onChangeName,
  onNext,
}: PhotoUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canProceed = !!photo && petName.trim().length > 0;

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const validation = validateImage(file);
        if (!validation.valid) {
          setError(validation.error ?? "画像の形式が正しくありません");
          return;
        }
        const compatible = await ensureBrowserCompatible(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) onSelectPhoto(e.target.result as string);
        };
        reader.readAsDataURL(compatible);
      } catch {
        setError("画像の読み込みに失敗しました");
      }
    },
    [onSelectPhoto],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="px-5 pt-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="text-center text-lg font-bold">ペットの写真をアップロード</h2>
        <p className="mt-1 text-center text-[12px] text-gray-400">
          イラスト化したい写真を1枚選んでください
        </p>
      </motion.div>

      <div className="mx-auto mt-6 max-w-sm space-y-5">
        {/* ── Pet name input ── */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold text-gray-600">ペットの名前</label>
          <input
            type="text"
            value={petName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="例: モカ、ラテ、コタロウ"
            className="focus:border-accent focus:ring-accent/30 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-[14px] transition-colors focus:ring-1 focus:outline-none"
          />
        </div>

        {/* ── Drop zone / Preview ── */}
        <div>
          <label className="mb-1.5 block text-[12px] font-bold text-gray-600">写真</label>
          <div
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
              dragging
                ? "border-accent bg-accent/5"
                : photo
                  ? "border-transparent"
                  : "border-gray-200 bg-gray-50"
            }`}
            style={{ aspectRatio: photo ? undefined : "4/3" }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt="選択した写真"
                  className="w-full cursor-pointer rounded-2xl object-contain"
                  style={{ maxHeight: "420px" }}
                />
                <div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/40 to-transparent p-3">
                  <p className="text-center text-[11px] font-medium text-white/80">タップで変更</p>
                </div>
              </>
            ) : (
              <div className="flex h-full cursor-pointer flex-col items-center justify-center gap-3 p-6">
                <div className="bg-accent/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-accent h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-gray-600">タップして写真を選択</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">またはドラッグ&ドロップ</p>
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </div>
          {error && <p className="mt-2 text-center text-[12px] text-red-500">{error}</p>}
        </div>

        {/* ── CTA ── */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="bg-accent h-12 w-full rounded-full text-[15px] font-bold text-white transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
