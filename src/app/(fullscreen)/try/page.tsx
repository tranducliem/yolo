"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import PaywallModal from "@/components/features/auth/PaywallModal";

interface Photo {
  file: File;
  preview: string;
  /** Converted file (HEIC→JPEG) or original, available after async processing */
  processed: File | null;
}

/**
 * Convert HEIC to JPEG using heic2any (dynamic import to avoid SSR issues).
 * Returns original file if not HEIC or conversion fails.
 */
async function convertIfHeic(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!isHeic) return file;

  try {
    const heic2any = (await import("heic2any")).default;
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const resultBlob = Array.isArray(blob) ? blob[0] : blob;
    return new File([resultBlob], file.name.replace(/\.hei[cf]$/i, ".jpg"), {
      type: "image/jpeg",
    });
  } catch (err) {
    console.warn("HEIC conversion failed, using original:", err);
    return file;
  }
}

/**
 * Resize image to maxSize using canvas. Returns base64 JPEG string.
 */
function resizeToBase64(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width,
          h = img.height;
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
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Image decode failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
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
  const [error, setError] = useState("");
  const [showBlock, setShowBlock] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [processing, setProcessing] = useState(0); // count of files still being processed
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn && getTryCount() >= 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing from external check
      setShowBlock(true);
    }
  }, [isLoggedIn, getTryCount]);

  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.preview) URL.revokeObjectURL(p.preview);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Add files with INSTANT preview, then process HEIC conversion in background.
   */
  const addFiles = useCallback(async (files: FileList) => {
    setError("");
    const fileArray = Array.from(files);

    // Step 1: Create instant previews using URL.createObjectURL (no decoding needed)
    const instantPhotos: Photo[] = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      processed: null, // not yet processed
    }));

    // Step 2: Add to state IMMEDIATELY — user sees previews right away
    setPhotos((prev) => {
      const combined = [...prev, ...instantPhotos];
      if (combined.length > 20) {
        combined.slice(20).forEach((p) => {
          if (p.preview) URL.revokeObjectURL(p.preview);
        });
        setError("最大20枚です");
        return combined.slice(0, 20);
      }
      return combined;
    });

    // Step 3: Process HEIC conversion in background (async, non-blocking)
    setProcessing((c) => c + fileArray.length);

    for (const file of fileArray) {
      convertIfHeic(file)
        .then((convertedFile) => {
          setPhotos((prev) =>
            prev.map((p) => {
              if (p.file === file) {
                // Update preview if conversion created a new file (HEIC→JPEG)
                const newPreview =
                  convertedFile !== file ? URL.createObjectURL(convertedFile) : p.preview;
                return { ...p, processed: convertedFile, preview: newPreview };
              }
              return p;
            }),
          );
        })
        .catch(() => {
          // Keep original file as fallback
          setPhotos((prev) => prev.map((p) => (p.file === file ? { ...p, processed: file } : p)));
        })
        .finally(() => {
          setProcessing((c) => Math.max(0, c - 1));
        });
    }
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

  const handleAnalyze = async () => {
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (photos.length < 1) return;
    setSubmitting(true);
    setError("");

    try {
      // Use processed files (HEIC already converted), fallback to original
      const filesToProcess = photos.map((p) => p.processed ?? p.file);

      // Resize for API (1024px) and preview (600px) in parallel
      const [apiPhotos, previews] = await Promise.all([
        Promise.all(
          filesToProcess.map(async (file, i) => {
            const full = await resizeToBase64(file, 1024);
            return {
              name: photos[i].file.name,
              base64: full.split(",")[1],
              type: "image/jpeg",
            };
          }),
        ),
        Promise.all(filesToProcess.map((file) => resizeToBase64(file, 600))),
      ]);

      sessionStorage.setItem("yolo_pet_name", name.trim());
      sessionStorage.setItem("yolo_photos", JSON.stringify(apiPhotos));
      sessionStorage.setItem("yolo_photo_previews", JSON.stringify(previews));

      incrementTry();
      router.push("/analyzing");
    } catch (err) {
      console.error("Photo processing error:", err);
      setError("写真の処理中にエラーが発生しました。JPEG/PNG形式の写真をお試しください。");
      setSubmitting(false);
    }
  };

  const allProcessed = processing === 0;
  const canSubmit = !submitting && allProcessed && photos.length >= 1 && name.trim().length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-14 items-center gap-3 border-b border-gray-100 px-4"
      >
        <Link href="/" className="text-sm text-gray-500">
          ← 戻る
        </Link>
        <span className="text-accent text-lg font-bold">🐾 YOLO</span>
      </motion.div>

      {/* 2nd attempt block overlay for non-logged-in */}
      <AnimatePresence>
        {showBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-white/95 px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-4 text-5xl"
              >
                🐾
              </motion.div>
              <h2 className="mb-2 text-xl font-bold">2回目以降はアカウントが必要です</h2>
              <p className="mb-6 text-sm text-gray-500">
                無料で登録して、何度でもベストショットを探そう
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signup"
                  className="from-accent to-accent-light mx-auto mb-3 block w-full max-w-xs rounded-xl bg-gradient-to-r py-4 text-center text-lg font-bold text-white shadow-lg"
                >
                  無料で登録する
                </Link>
              </motion.div>
              <Link
                href="/results"
                className="text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                1回目の結果をもう一度見る
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-md px-4 py-8 md:max-w-lg">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="mb-1 text-center text-2xl font-bold">ベストショットを見つけよう</h1>
          <p className="mb-8 text-center text-sm text-gray-500">写真を選ぶだけ。登録不要です。</p>
        </motion.div>

        {/* Pet name input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mb-6"
        >
          <label className="mb-2 block text-sm font-medium text-gray-700">ペットの名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: モカ、ポチ、ミケ"
            className="focus:ring-accent/50 focus:border-accent w-full rounded-xl border border-gray-300 px-4 py-3 text-lg transition-all duration-200 focus:ring-2 focus:outline-none"
          />
        </motion.div>

        {/* Photo upload drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mb-6"
        >
          <label className="mb-2 block text-sm font-medium text-gray-700">
            写真をアップロード（1〜20枚）
          </label>
          <motion.div
            animate={{ scale: dragging ? 1.03 : 1 }}
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
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-200 ${
              dragging
                ? "border-accent bg-accent/5"
                : hovering
                  ? "border-accent"
                  : "border-gray-300"
            }`}
          >
            <motion.div
              animate={dragging ? { y: [0, -6, 0] } : {}}
              transition={dragging ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" } : {}}
              className="mb-3 text-4xl"
            >
              📷
            </motion.div>
            <AnimatePresence mode="wait">
              {dragging ? (
                <motion.p
                  key="drop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-accent font-bold"
                >
                  ここにドロップ！
                </motion.p>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="font-medium text-gray-600">ドラッグ&ドロップ or タップで選択</p>
                  <p className="mt-1 text-sm text-gray-400">JPG, PNG, HEIC対応 / 1〜20枚</p>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </motion.div>
        </motion.div>

        {/* Processing indicator */}
        <AnimatePresence>
          {processing > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-accent mb-4 animate-pulse text-center text-sm"
            >
              写真を最適化中... ({processing}枚残り)
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
              <div className="mb-3 flex items-center gap-2">
                <motion.span
                  key={photos.length}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="bg-accent inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white"
                >
                  📷 {photos.length}枚選択中
                </motion.span>
                <span className="text-xs text-gray-400">（✕ボタンで削除）</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <motion.div
                    key={`${p.file.name}-${p.file.size}-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: removingIndex === i ? 0 : 1,
                      opacity: removingIndex === i ? 0 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.8 }}
                    className="group relative aspect-square overflow-hidden rounded-lg"
                  >
                    {p.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100">
                        <span className="text-2xl">📷</span>
                      </div>
                    )}
                    {!p.processed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(i);
                      }}
                      className="bg-red hover:bg-red/90 absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white opacity-100 shadow-md transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red mb-4 text-center text-sm"
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
          onClick={handleAnalyze}
          disabled={!canSubmit}
          className="from-accent to-accent-light shadow-accent/25 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-4 text-lg font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="inline-block h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              />
              写真を準備中...
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
          className="mt-4 text-center text-xs text-gray-400"
        >
          写真はAI分析のみに使用され、保存されません
        </motion.p>
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="bestshot"
        requiredPlan="plus"
      />
    </div>
  );
}
