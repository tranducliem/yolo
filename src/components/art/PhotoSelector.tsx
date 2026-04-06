"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  photo: string | null;
  petName: string;
  onPhotoChange: (photo: string | null) => void;
  onPetNameChange: (name: string) => void;
  onUseBestShot?: () => void;
  hasBestShot: boolean;
};

export default function PhotoSelector({
  photo,
  petName,
  onPhotoChange,
  onPetNameChange,
  onUseBestShot,
  hasBestShot,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Resize to 1024px for API
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 1024;
          let w = img.width;
          let h = img.height;
          if (w > maxSize || h > maxSize) {
            if (w > h) {
              h = (h / w) * maxSize;
              w = maxSize;
            } else {
              w = (w / h) * maxSize;
              h = maxSize;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, w, h);
          onPhotoChange(canvas.toDataURL("image/jpeg", 0.85));
          setIsLoading(false);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } catch {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">イラストにする写真を選んでください</h2>
        <p className="mt-1 text-sm text-gray-500">お気に入りの1枚が、世界に1つのアートに</p>
      </div>

      <AnimatePresence mode="wait">
        {!photo ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${isDragging ? "border-[#2A9D8F] bg-[#f0fdfb]" : "border-gray-300 hover:border-[#2A9D8F] hover:bg-[#f0fdfb]"} `}
            >
              {isLoading ? (
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#2A9D8F] border-t-transparent" />
              ) : (
                <>
                  <span className="mb-3 text-5xl">📷</span>
                  <p className="text-sm text-gray-500">タップして写真を選ぶ</p>
                  <p className="mt-1 text-xs text-gray-400">JPG, PNG, HEIC対応</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            {hasBestShot && (
              <button
                onClick={onUseBestShot}
                className="mt-4 h-10 w-full rounded-xl border-2 border-[#2A9D8F] text-sm font-medium text-[#2A9D8F] transition-colors hover:bg-[#f0fdfb]"
              >
                ✨ ベストショットの写真を使う
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative">
              <img
                src={photo}
                alt="選択した写真"
                className="mx-auto h-64 w-64 rounded-2xl object-cover"
              />
            </div>
            <button
              onClick={() => {
                onPhotoChange(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs font-medium text-[#2A9D8F]"
            >
              📷 変更する
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            <input
              type="text"
              value={petName}
              onChange={(e) => onPetNameChange(e.target.value)}
              placeholder="ペットの名前（例: モカ）"
              className="w-full max-w-xs rounded-xl border border-gray-300 px-4 py-3 text-center text-sm focus:border-[#2A9D8F] focus:outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
