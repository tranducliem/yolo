"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, photobooks } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import ProductMockup from "@/components/features/shop/ProductMockup";
import type { MockupType } from "@/components/features/shop/ProductMockup";

const me = mockPets[0];

/** Map photobook id → mockup type */
function toBookMockup(id: string): MockupType {
  const map: Record<string, MockupType> = {
    "book-pocket": "book-pocket",
    "book-bunko": "book-bunko",
    "book-life": "book-life",
  };
  return map[id] ?? "book-pocket";
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

  const template = photobooks.find((t) => t.id === tpl);
  const donationAmount = template ? template.donationAmount : 0;

  const toggle = (i: number) =>
    setSel((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < 20 ? [...p, i] : p));

  type Page =
    | { type: "cover"; title: string; sub: string }
    | { type: "photo"; url: string; comment: string; date: string }
    | { type: "end"; text: string };

  const pages: Page[] = [
    { type: "cover", title: `${me.name}のフォトブック`, sub: "YOLO Book" },
    ...sel.map((idx) => ({
      type: "photo" as const,
      url: me.photos[idx % me.photos.length],
      comment: "AIが選んだベストショット",
      date: "2026年3月",
    })),
    { type: "end", text: `${me.name}と過ごした47日間の記録` },
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
        imageUrl: me.imageUrl,
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
              <p className="mb-2 text-sm text-[#4B5563]">
                {sel.length}枚選択中（8枚以上で注文可能）
              </p>
              <div className="mb-4 grid grid-cols-3 gap-1">
                {me.photos.map((url, i) => (
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
            </motion.div>
          )}

          {/* Step 2: Template selection - with product mockups */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-4 space-y-3">
                {photobooks.map((t, i) => (
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
                        <ProductMockup type={toBookMockup(t.id)} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0D1B2A]">{t.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{t.subtitle}</p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {t.size} ・ {t.pages}
                        </p>
                        <p className="text-accent mt-1 text-lg font-bold">
                          ¥{t.price.toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-[10px] text-emerald-600">
                          🌟 ¥{t.donationAmount.toLocaleString()}が寄付に
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                      src={me.imageUrl}
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
                    <ProductMockup type={toBookMockup(template.id)} className="h-full w-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0D1B2A]">{template.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {template.size} ・ {template.pages}
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
