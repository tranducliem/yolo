"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, photobooks } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import ProductMockup from "@/components/ProductMockup";
import type { MockupType } from "@/components/ProductMockup";

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
    setSel((p) =>
      p.includes(i) ? p.filter((x) => x !== i) : p.length < 20 ? [...p, i] : p
    );

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
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#0D1B2A] text-center mb-2"
        >
          📖 YOLO Book
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-sm text-[#9CA3AF] text-center mb-1"
        >
          ベストショットを本に
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="text-[11px] text-gray-400 text-center mb-4"
        >
          提供: Photoback（MONO-LINK）
        </motion.p>

        {/* Donation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2"
        >
          <span className="text-lg">🌟</span>
          <p className="text-xs text-emerald-700 font-medium">
            購入額の5%が保護施設に届きます
          </p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="flex items-center justify-center gap-4 mb-6"
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
              <p className="text-sm text-[#4B5563] mb-2">
                {sel.length}枚選択中（8枚以上で注文可能）
              </p>
              <div className="grid grid-cols-3 gap-1 mb-4">
                {me.photos.map((url, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer relative transition-all ${
                      sel.includes(i) ? "ring-4 ring-accent" : ""
                    }`}
                    onClick={() => toggle(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {sel.includes(i) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      >
                        {sel.indexOf(i) + 1}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              <label className="flex items-center gap-2 mb-4 text-sm">
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
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold disabled:opacity-40 disabled:shadow-none transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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
              <div className="space-y-3 mb-4">
                {photobooks.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                      tpl === t.id ? "ring-4 ring-accent shadow-md" : ""
                    }`}
                    onClick={() => setTpl(t.id)}
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                        <ProductMockup
                          type={toBookMockup(t.id)}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0D1B2A]">{t.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.subtitle}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{t.size} ・ {t.pages}</p>
                        <p className="text-accent font-bold text-lg mt-1">
                          ¥{t.price.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">
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
                  className="px-6 h-12 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  ← 戻る
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)}
                  disabled={!tpl}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold disabled:opacity-40 disabled:shadow-none transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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
                className="bg-white rounded-2xl shadow-xl p-6 mb-4 min-h-[300px] flex flex-col items-center justify-center"
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
                      className="w-40 h-40 rounded-xl object-cover mx-auto mb-4 shadow"
                    />
                    <h2 className="text-2xl font-bold text-[#0D1B2A]">
                      {(pages[page] as { title: string }).title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
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
                      className="w-full max-w-[250px] aspect-square rounded-xl object-cover mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-600">
                      {(pages[page] as { comment: string }).comment}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(pages[page] as { date: string }).date}
                    </p>
                  </div>
                )}
                {pages[page]?.type === "end" && (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-4">🐾</p>
                    <p className="text-lg font-bold text-gray-700">
                      {(pages[page] as { text: string }).text}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Page controls */}
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm disabled:opacity-30 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                >
                  ← 前
                </motion.button>
                <span className="text-sm text-[#9CA3AF]">
                  {page + 1} / {pages.length}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setPage((p) => Math.min(pages.length - 1, p + 1))
                  }
                  disabled={page === pages.length - 1}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm disabled:opacity-30 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
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
                  className="bg-white rounded-xl p-3 mb-3 flex items-center gap-3 border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ProductMockup
                      type={toBookMockup(template.id)}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0D1B2A]">{template.name}</p>
                    <p className="text-[11px] text-gray-400">{template.size} ・ {template.pages}</p>
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
                  className="bg-emerald-50 rounded-xl p-3 mb-4 flex items-center gap-2"
                >
                  <span className="text-lg">🌟</span>
                  <p className="text-xs text-emerald-700 font-medium">
                    この購入で¥{donationAmount.toLocaleString()}が保護施設に届きます
                  </p>
                </motion.div>
              )}

              {/* Gift wrapping checkbox */}
              <label className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-600">
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
                  className="px-6 h-14 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  ← 戻る
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrder}
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  🛒 カートに入れる ¥{template?.price.toLocaleString()}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="book" />
    </div>
  );
}
