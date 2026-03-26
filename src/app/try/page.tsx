"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { setSessionData } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";

interface Photo { file: File; preview: string }

function testImage(file: File): Promise<Photo> {
  const url = URL.createObjectURL(file);
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ file, preview: url });
    img.onerror = () => { URL.revokeObjectURL(url); res({ file, preview: "" }); };
    img.src = url;
  });
}

export default function TryPage() {
  const router = useRouter();
  const { isLoggedIn, getTryCount, incrementTry } = useAuth();
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [showBlock, setShowBlock] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2nd attempt check for non-logged-in
  useEffect(() => {
    if (!isLoggedIn && getTryCount() >= 1) {
      setShowBlock(true);
    }
  }, [isLoggedIn, getTryCount]);

  useEffect(() => () => { photos.forEach((p) => { if (p.preview) URL.revokeObjectURL(p.preview); }); }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback(async (files: FileList) => {
    setPreparing(true); setError("");
    const items = await Promise.all(Array.from(files).map(testImage));
    setPhotos((prev) => {
      const c = [...prev, ...items];
      if (c.length > 20) { c.slice(20).forEach((p) => { if (p.preview) URL.revokeObjectURL(p.preview); }); setError("最大20枚です"); return c.slice(0, 20); }
      return c;
    });
    setPreparing(false);
  }, []);

  const remove = (i: number) => setPhotos((p) => { if (p[i].preview) URL.revokeObjectURL(p[i].preview); return p.filter((_, j) => j !== i); });

  const submit = async () => {
    if (!name.trim()) { setError("名前を入力してください"); return; }
    if (photos.length < 5) return;
    setSubmitting(true);
    const images = await Promise.all(photos.map((p) => new Promise<string>((r) => { const fr = new FileReader(); fr.onloadend = () => r(fr.result as string); fr.readAsDataURL(p.file); })));
    setSessionData({ petName: name.trim(), images });
    incrementTry();
    router.push("/analyzing");
  };

  const remaining = Math.max(0, 5 - photos.length);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100">
        <Link href="/" className="text-gray-500 text-sm">← 戻る</Link>
        <span className="text-lg font-bold text-accent">🐾 tomoni</span>
      </div>

      {/* 2nd attempt block overlay */}
      {showBlock && (
        <div className="fixed inset-0 z-[80] bg-white/95 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-xl font-bold mb-2">2回目以降はアカウントが必要です</h2>
          <p className="text-gray-500 text-sm mb-6">無料で登録して、何度でもベストショットを探そう</p>
          <Link href="/signup" className="block w-full max-w-xs py-4 bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg rounded-xl shadow-lg text-center mb-3">
            無料で登録する
          </Link>
          <Link href="/results" className="text-sm text-gray-400 hover:text-gray-600">1回目の結果をもう一度見る</Link>
        </div>
      )}

      <div className="max-w-md md:max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-center mb-1">ベストショットを見つけよう</h1>
          <p className="text-gray-500 text-sm text-center mb-8">写真を選ぶだけ。登録不要です。</p>
        </motion.div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">ペットの名前</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: モカ、ポチ、ミケ"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">写真をアップロード（5〜20枚）</label>
          <div onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${dragging ? "border-accent bg-accent/5" : "border-gray-300 hover:border-accent/50"}`}>
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-600 font-medium">ドラッグ&ドロップ or タップで選択</p>
            <p className="text-gray-400 text-sm mt-1">JPG, PNG対応 / 5〜20枚</p>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/heic,.heic" multiple
              onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} className="hidden" />
          </div>
        </div>

        {preparing && <p className="text-accent text-sm mb-4 animate-pulse text-center">写真を準備しています...</p>}

        {photos.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">{photos.length}枚選択中 <span className="text-xs text-gray-400">（タップで削除）</span></p>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <motion.div key={`${p.file.name}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => remove(i)}>
                  {p.preview
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center"><span className="text-2xl">📷</span></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xl">✕</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {remaining > 0 && photos.length > 0 && <p className="text-sm text-amber-600 mb-4 text-center">あと{remaining}枚追加してください</p>}
        {error && <p className="text-red text-sm mb-4 text-center">{error}</p>}

        <motion.button whileTap={{ scale: 0.98 }} onClick={submit}
          disabled={submitting || preparing || photos.length < 5 || !name.trim()}
          className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-accent to-accent-light shadow-lg shadow-accent/25 disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? "準備中..." : "✨ ベストショットを見つける"}
        </motion.button>

        <p className="text-xs text-gray-400 mt-4 text-center">写真はAI分析のみに使用され、保存されません</p>
      </div>
    </div>
  );
}
