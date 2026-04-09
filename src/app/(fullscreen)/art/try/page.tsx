"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ART_STYLES, STYLE_FILTERS } from "@/lib/art-styles";
import PhotoUploader from "@/components/art/PhotoUploader";
import StyleSelector from "@/components/art/StyleSelector";
import ConfirmGenerate from "@/components/art/ConfirmGenerate";
import ConvertAnimation, { type ArtErrorReason } from "@/components/art/ConvertAnimation";
import ArtResult from "@/components/art/ArtResult";

type Step = "upload" | "style" | "confirm" | "converting" | "result";

export default function ArtTryPage() {
  const [step, setStep] = useState<Step>("upload");
  const [photo, setPhoto] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [styleId, setStyleId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<ArtErrorReason | null>(null);

  const stepNumber = step === "upload" ? 1 : step === "style" ? 2 : 3;
  const showHeader = step !== "converting" && step !== "result";
  const selectedArt = ART_STYLES.find((s: { id: string }) => s.id === styleId);
  const selectedStyle = selectedArt
    ? { ...selectedArt, filter: STYLE_FILTERS[selectedArt.id] || "", premium: !selectedArt.isFree }
    : null;

  const handleRetry = () => {
    setStyleId(null);
    setGeneratedImage(null);
    setErrorReason(null);
    setStep("style");
  };

  const handleConversionComplete = (imageUrl: string | null, reason: ArtErrorReason | null) => {
    setGeneratedImage(imageUrl);
    setErrorReason(reason);
    setStep("result");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ── Header ── */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex h-14 items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-md"
        >
          <Link href="/art" className="text-sm text-gray-500">
            ← 戻る
          </Link>
          <span className="text-accent text-lg font-bold">🐾 YOLO</span>
        </motion.div>
      )}

      {/* ── Progress ── */}
      {showHeader && (
        <div className="flex items-center gap-3 px-5 pt-3">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-[3px] flex-1 rounded-full transition-colors ${
                  n <= stepNumber ? "bg-accent" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">{stepNumber}/3</span>
        </div>
      )}

      {/* ── Steps ── */}
      <AnimatePresence mode="wait">
        {/* Step 1: 写真 + ペット名 */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <PhotoUploader
              photo={photo}
              petName={petName}
              onSelectPhoto={setPhoto}
              onChangeName={setPetName}
              onNext={() => setStep("style")}
            />
          </motion.div>
        )}

        {/* Step 2: スタイル選択 */}
        {step === "style" && photo && (
          <motion.div
            key="style"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <StyleSelector
              photo={photo}
              selected={styleId}
              onSelect={setStyleId}
              onNext={() => setStep("confirm")}
              onBack={() => setStep("upload")}
            />
          </motion.div>
        )}

        {/* Step 3: 確認 + 生成 */}
        {step === "confirm" && photo && selectedStyle && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <ConfirmGenerate
              photo={photo}
              petName={petName || "ペット"}
              styleName={selectedStyle.name}
              styleEmoji={selectedStyle.emoji}
              styleFilter={selectedStyle.filter}
              onGenerate={() => setStep("converting")}
              onBack={() => setStep("style")}
            />
          </motion.div>
        )}

        {/* 変換アニメーション (+ API call) */}
        {step === "converting" && photo && selectedStyle && styleId && (
          <motion.div
            key="converting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ConvertAnimation
              photo={photo}
              styleName={selectedStyle.name}
              styleFilter={selectedStyle.filter}
              petName={petName || "ペット"}
              styleId={styleId}
              onComplete={handleConversionComplete}
            />
          </motion.div>
        )}

        {/* 結果 */}
        {step === "result" && photo && selectedStyle && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ArtResult
              photo={photo}
              generatedImage={generatedImage}
              errorReason={errorReason}
              styleFilter={selectedStyle.filter}
              styleName={selectedStyle.name}
              styleEmoji={selectedStyle.emoji}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
