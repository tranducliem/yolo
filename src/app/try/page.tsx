"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { setSessionData, setProcessedPhotos } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";

interface Photo {
  file: File;
  preview: string;
}

function testImage(file: File): Promise<Photo> {
  const url = URL.createObjectURL(file);
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ file, preview: url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      res({ file, preview: "" });
    };
    img.src = url;
  });
}

function resizeAndConvertToBase64(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TryPage() {
  const router = useRouter();
  const { isLoggedIn, getTryCount, incrementTry } = useAuth();
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [showBlock, setShowBlock] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn && getTryCount() >= 1) {
      setShowBlock(true);
    }
  }, [isLoggedIn, getTryCount]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.preview) URL.revokeObjectURL(p.preview);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback(async (files: FileList) => {
    setPreparing(true);
    setError("");
    const items = await Promise.all(Array.from(files).map(testImage));
    setPhotos((prev) => {
      const c = [...prev, ...items];
      if (c.length > 20) {
        c.slice(20).forEach((p) => {
          if (p.preview) URL.revokeObjectURL(p.preview);
        });
        setError("最大20枚です");
        return c.slice(0, 20);
      }
      return c;
    });
    setPreparing(false);
  }, []);

  const remove = (i: number) => {
    setRemovingIndex(i);
    setTimeout(() => {
      setPhotos((p) => {
        if (p[i]?.preview) URL.revokeObjectURL(p[i].preview);
        return p.filter((_, j) => j !== i);
      });
      setRemovingIndex(null);
    }, 200);
  };

  const submit = async () => {
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (photos.length < 5) return;
    setSubmitting(true);

    // Convert all photos to data URLs for display
    const images = await Promise.all(
      photos.map(
        (p) =>
          new Promise<string>((r) => {
            const fr = new FileReader();
            fr.onloadend = () => r(fr.result as string);
            fr.readAsDataURL(p.file);
          })
      )
    );

    // Resize photos and prepare base64 for API
    const processed = await Promise.all(
      photos.map(async (photo) => {
        const dataUrl = await resizeAndConvertToBase64(photo.file, 1024);
        return {
          name: photo.file.name,
          base64: dataUrl.split(',')[1], // Remove data:image/... prefix
          type: photo.file.type || 'image/jpeg',
        };
      })
    );

    // Store both display images and API-ready photos
    setSessionData({ petName: name.trim(), images });
    setProcessedPhotos(processed);
    incrementTry();
    router.push("/analyzing");
  };

  const remaining = Math.max(0, 5 - photos.length);
  const canSubmit =
    !submitting && !preparing && photos.length >= 5 && name.trim().length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-3 px-4 h-14 border-b border-gray-100"
      >
        <Link href="/" className="text-gray-500 text-sm">
          ← 戻る
        </Link>
        <span className="text-lg font-bold text-accent">🐾 YOLO</span>
      </motion.div>

      {/* 2nd attempt block overlay for non-logged-in */}
      <AnimatePresence>
        {showBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] bg-white/95 flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-5xl mb-4"
              >
                🐾
              </motion.div>
              <h2 className="text-xl font-bold mb-2">
                2回目以降はアカウントが必要です
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                無料で登録して、何度でもベストショットを探そう
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/signup"
                  className="block w-full max-w-xs mx-auto py-4 bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg rounded-xl shadow-lg text-center mb-3"
                >
                  無料で登録する
                </Link>
              </motion.div>
              <Link
                href="/results"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                1回目の結果をもう一度見る
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md md:max-w-lg mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-bold text-center mb-1">
            ベストショットを見つけよう
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            写真を選ぶだけ。登録不要です。
          </p>
        </motion.div>

        {/* Pet name input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ペットの名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: モカ、ポチ、ミケ"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
          />
        </motion.div>

        {/* Photo upload drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真をアップロード（5〜20枚）
          </label>
          <motion.div
            animate={{
              scale: dragging ? 1.03 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors duration-200 ${
              dragging
                ? "border-accent bg-accent/5"
                : hovering
                  ? "border-accent"
                  : "border-gray-300"
            }`}
          >
            <motion.div
              animate={dragging ? { y: [0, -6, 0] } : {}}
              transition={
                dragging
                  ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
                  : {}
              }
              className="text-4xl mb-3"
            >
              📷
            </motion.div>
            <AnimatePresence mode="wait">
              {dragging ? (
                <motion.p
                  key="drop-text"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-accent font-bold"
                >
                  ここにドロップ！
                </motion.p>
              ) : (
                <motion.div
                  key="default-text"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-gray-600 font-medium">
                    ドラッグ&ドロップ or タップで選択
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    JPG, PNG, HEIC対応 / 5〜20枚
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,.heic"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </motion.div>
        </motion.div>

        {/* Preparing indicator */}
        <AnimatePresence>
          {preparing && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-accent text-sm mb-4 animate-pulse text-center"
            >
              写真を準備しています...
            </motion.p>
          )}
        </AnimatePresence>

        {/* Count pill + Grid thumbnails */}
        <AnimatePresence>
          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              {/* Count pill */}
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  key={photos.length}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="inline-flex items-center bg-accent text-white rounded-full px-3 py-1 text-sm font-medium"
                >
                  📷 {photos.length}枚選択中
                </motion.span>
                <span className="text-xs text-gray-400">
                  （✕ボタンで削除）
                </span>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <motion.div
                    key={`${p.file.name}-${p.file.size}-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: removingIndex === i ? 0 : 1,
                      opacity: removingIndex === i ? 0 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                      mass: 0.8,
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    {p.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                        <span className="text-2xl">📷</span>
                      </div>
                    )}
                    {/* Delete button - always visible on mobile (no hover), visible on hover for desktop */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(i);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 hover:bg-red/90"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remaining photos warning */}
        <AnimatePresence>
          {remaining > 0 && photos.length > 0 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-amber-600 mb-4 text-center"
            >
              あと{remaining}枚追加してください
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: canSubmit && !submitting ? [0, -4, 0] : 0,
          }}
          transition={
            canSubmit && !submitting
              ? {
                  y: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 0.5,
                  },
                  opacity: { duration: 0.5, delay: 0.3 },
                }
              : { opacity: { duration: 0.5, delay: 0.3 } }
          }
          whileTap={canSubmit ? { scale: 0.95 } : {}}
          onClick={submit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-accent to-accent-light shadow-lg shadow-accent/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: "linear",
                }}
                className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              準備中...
            </>
          ) : (
            "✨ ベストショットを見つける"
          )}
        </motion.button>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-gray-400 mt-4 text-center"
        >
          写真はAI分析のみに使用され、保存されません
        </motion.p>
      </div>
    </div>
  );
}
