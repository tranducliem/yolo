"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import ProductMockup from "@/components/features/shop/ProductMockup";
import type { MockupType } from "@/components/features/shop/ProductMockup";

interface PetMe {
  id: string;
  name: string;
  imageUrl: string;
  photos: string[];
}

interface BookProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string;
  donation_percent: number;
  partner: string;
}

// Book-specific display metadata (not stored in DB)
const bookMeta: Record<string, { subtitle: string; size: string; pages: string }> = {
  "book-pocket": {
    subtitle: "手のひらサイズ。持ち歩ける思い出",
    size: "L判（89×127mm）",
    pages: "16〜36ページ",
  },
  "book-bunko": {
    subtitle: "文庫本スタイル。帯付きの本格派",
    size: "文庫判（105×148mm）",
    pages: "16〜48ページ",
  },
  "book-life": {
    subtitle: "大判のプレミアム。一生ものの1冊",
    size: "A5判（148×210mm）",
    pages: "24〜96ページ",
  },
};

function toBookMockup(sku: string): MockupType {
  const map: Record<string, MockupType> = {
    "book-pocket": "book-pocket",
    "book-bunko": "book-bunko",
    "book-life": "book-life",
  };
  return map[sku] ?? "book-pocket";
}

export default function BookPage() {
  const router = useRouter();
  const { isLoggedIn, addToCart } = useAuth();
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<number[]>([]);
  const [tpl, setTpl] = useState<string | null>(null);
  const [inclIllust, setInclIllust] = useState(false);
  const [page, setPage] = useState(0);
  const [authModal, setAuthModal] = useState(false);
  const [gift, setGift] = useState(false);
  const [books, setBooks] = useState<BookProduct[]>([]);
  const [me, setMe] = useState<PetMe | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/pets/me");
      if (res.ok) {
        const data = await res.json();
        if (data.pet) setMe(data.pet);
      }
    } catch {
      /* no fallback */
    } finally {
      setMeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
    fetch("/api/products?category=book")
      .then((r) => r.json())
      .then((d) => setBooks(d.products || []))
      .catch(() => {});
  }, [fetchMe]);

  const template = books.find((t) => t.id === tpl);
  const donationAmount = template
    ? Math.floor(template.price * (template.donation_percent / 100))
    : 0;
  const meta = template ? bookMeta[template.sku] : null;

  const toggle = (i: number) =>
    setSel((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < 20 ? [...p, i] : p));

  type Page =
    | { type: "cover"; title: string; sub: string }
    | { type: "photo"; url: string; comment: string; date: string }
    | { type: "end"; text: string };

  const petName = me?.name || "ペット";
  const petPhotos = me?.photos || [];

  const pages: Page[] = [
    { type: "cover", title: `${petName}のフォトブック`, sub: "YOLO Book" },
    ...sel.map((idx) => ({
      type: "photo" as const,
      url: petPhotos[idx % Math.max(petPhotos.length, 1)] || "/images/default-avatar.png",
      comment: "AIが選んだベストショット",
      date: "2026年3月",
    })),
    { type: "end", text: `${petName}と過ごした日々の記録` },
  ];

  const handleOrder = () => {
    if (!isLoggedIn) {
      setAuthModal(true);
      return;
    }
    if (template) {
      addToCart({
        goodsId: template.id,
        name: `フォトブック（${template.name}）`,
        price: template.price,
        quantity: 1,
        imageUrl: me?.imageUrl || "/images/default-avatar.png",
        variant: gift ? "ギフト" : undefined,
      });
      router.push("/cart");
    }
  };

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-center text-3xl font-bold text-[#0D1B2A]"
        >
          📖 YOLO Book
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-1 text-center text-sm text-[#9CA3AF]"
        >
          ベストショットを本に
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mb-4 text-center text-[11px] text-gray-400"
        >
          提供: Photoback（MONO-LINK）
        </motion.p>

        {/* Donation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5"
        >
          <span className="text-lg">🌟</span>
          <p className="text-xs font-medium text-emerald-700">購入額の5%が保護施設に届きます</p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mb-6 flex items-center justify-center gap-4"
        >
          {["①写真選択", "②テンプレート", "③プレビュー"].map((l, i) => (
            <span
              key={i}
              className={`text-xs font-bold transition-colors ${
                step > i ? "text-accent" : "text-gray-400"
              }`}
            >
              {l}
            </span>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Photo selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {meLoading ? (
                <div className="space-y-3">
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
                    ))}
                  </div>
                </div>
              ) : petPhotos.length > 0 ? (
                <>
                  <p className="mb-2 text-sm text-[#4B5563]">
                    {sel.length}枚選択中（8枚以上で注文可能）
                  </p>
                  <div className="mb-4 grid grid-cols-3 gap-1">
                    {petPhotos.map((url, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-all ${
                          sel.includes(i) ? "ring-accent ring-4" : ""
                        }`}
                        onClick={() => toggle(i)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {sel.includes(i) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-accent absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          >
                            {sel.indexOf(i) + 1}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <label className="mb-4 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={inclIllust}
                      onChange={(e) => setInclIllust(e.target.checked)}
                      className="accent-accent"
                    />
                    イラスト版も含める
                  </label>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    disabled={sel.length < 8}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                  >
                    次へ（{sel.length}枚）
                  </motion.button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="mb-2 text-4xl">📷</p>
                  <p className="mb-1 text-lg font-bold text-gray-700">写真がありません</p>
                  <p className="mb-4 text-sm text-gray-400">
                    ベストショットを撮って写真を追加しましょう
                  </p>
                  <Link
                    href="/try"
                    className="rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    ✨ ベストショットを撮る
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Template selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-4 space-y-3">
                {books.map((t, i) => {
                  const m = bookMeta[t.sku];
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        tpl === t.id ? "ring-accent shadow-md ring-4" : ""
                      }`}
                      onClick={() => setTpl(t.id)}
                    >
                      <div className="flex gap-4 p-4">
                        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl">
                          <ProductMockup type={toBookMockup(t.sku)} className="h-full w-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#0D1B2A]">{t.name}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {m?.subtitle || t.description}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-400">
                            {m?.size} ・ {m?.pages}
                          </p>
                          <p className="text-accent mt-1 text-lg font-bold">
                            ¥{t.price.toLocaleString()}
                          </p>
                          <p className="mt-0.5 text-[10px] text-emerald-600">
                            🌟 ¥{Math.floor(t.price * (t.donation_percent / 100)).toLocaleString()}
                            が寄付に
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className="h-12 rounded-xl border border-gray-200 bg-white px-6 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50"
                >
                  ← 戻る
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)}
                  disabled={!tpl}
                  className="h-12 flex-1 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                >
                  プレビューを見る
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview with page flip */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="mb-4 flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-xl"
                key={page}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {pages[page]?.type === "cover" && (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={me?.imageUrl || "/images/default-avatar.png"}
                      alt=""
                      className="mx-auto mb-4 h-40 w-40 rounded-xl object-cover shadow"
                    />
                    <h2 className="text-2xl font-bold text-[#0D1B2A]">
                      {(pages[page] as { title: string }).title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {(pages[page] as { sub: string }).sub}
                    </p>
                  </div>
                )}
                {pages[page]?.type === "photo" && (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={(pages[page] as { url: string }).url}
                      alt=""
                      className="mx-auto mb-3 aspect-square w-full max-w-[250px] rounded-xl object-cover"
                    />
                    <p className="text-sm text-gray-600">
                      {(pages[page] as { comment: string }).comment}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {(pages[page] as { date: string }).date}
                    </p>
                  </div>
                )}
                {pages[page]?.type === "end" && (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-4xl">🐾</p>
                    <p className="text-lg font-bold text-gray-700">
                      {(pages[page] as { text: string }).text}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Page controls */}
              <div className="mb-4 flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-sm disabled:opacity-30"
                >
                  ← 前
                </motion.button>
                <span className="text-sm text-[#9CA3AF]">
                  {page + 1} / {pages.length}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
                  disabled={page === pages.length - 1}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-sm disabled:opacity-30"
                >
                  次 →
                </motion.button>
              </div>

              {/* Template info */}
              {template && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <ProductMockup type={toBookMockup(template.sku)} className="h-full w-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0D1B2A]">{template.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {meta?.size} ・ {meta?.pages}
                    </p>
                  </div>
                  <p className="text-accent font-bold">¥{template.price.toLocaleString()}</p>
                </motion.div>
              )}

              {/* Donation badge */}
              {template && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3"
                >
                  <span className="text-lg">🌟</span>
                  <p className="text-xs font-medium text-emerald-700">
                    この購入で¥{donationAmount.toLocaleString()}が保護施設に届きます
                  </p>
                </motion.div>
              )}

              {/* Gift wrapping checkbox */}
              <label className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={gift}
                  onChange={(e) => setGift(e.target.checked)}
                  className="accent-accent"
                />
                🎁 ギフトラッピング
              </label>

              {/* Order buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(2)}
                  className="h-14 rounded-xl border border-gray-200 bg-white px-6 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50"
                >
                  ← 戻る
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrder}
                  className="h-14 flex-1 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                >
                  🛒 カートに入れる ¥{template?.price.toLocaleString()}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="book" />
    </>
  );
}
