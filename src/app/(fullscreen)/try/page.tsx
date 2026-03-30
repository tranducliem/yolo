"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleAnalyze = async () => {
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (photos.length < 1) return;
    setSubmitting(true);

    try {
      // API送信用（1024px）
      const apiPhotos = await Promise.all(
        photos.map(async (p) => {
          const full = await resizeToBase64(p.file, 1024);
          return {
            name: p.file.name,
            base64: full.split(",")[1], // data:image/jpeg;base64, を除去
            type: "image/jpeg",
          };
        }),
      );

      // プレビュー用（600px。/resultsで写真を表示するため）
      const previews = await Promise.all(photos.map((p) => resizeToBase64(p.file, 600)));

      sessionStorage.setItem("yolo_pet_name", name.trim());
      sessionStorage.setItem("yolo_photos", JSON.stringify(apiPhotos));
      sessionStorage.setItem("yolo_photo_previews", JSON.stringify(previews));

      incrementTry();
      router.push("/analyzing");
    } catch (err) {
      console.error(err);
      setError("写真の処理中にエラーが発生しました。もう一度お試しください。");
      setSubmitting(false);
    }
  };

  const canSubmit = !submitting && !preparing && photos.length >= 1 && name.trim().length > 0;

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
                  <p className="font-medium text-gray-600">ドラッグ&ドロップ or タップで選択</p>
                  <p className="mt-1 text-sm text-gray-400">JPG, PNG, HEIC対応 / 1〜20枚</p>
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
              className="text-accent mb-4 animate-pulse text-center text-sm"
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
                    {/* Delete button */}
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
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: "linear",
                }}
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
    </div>
  );
}
