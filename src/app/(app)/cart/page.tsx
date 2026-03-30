"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem } from "@/types";
import AuthGate from "@/components/features/auth/AuthGate";

function CartContent() {
  const { loaded, getCart, updateCartQuantity, removeFromCart } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [giftWrap, setGiftWrap] = useState(false);

  const syncCart = useCallback(() => {
    setItems(getCart());
  }, [getCart]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing cart from external storage
    if (loaded) syncCart();
  }, [loaded, syncCart]);

  const handleQuantity = (id: string, delta: number) => {
    const item = items.find((c) => c.id === id);
    if (!item) return;
    const next = item.quantity + delta;
    if (next < 1) return;
    updateCartQuantity(id, next);
    syncCart();
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    syncCart();
  };

  const subtotal = items.reduce((s, c) => s + c.price * c.quantity, 0);
  const donationAmount = Math.ceil(subtotal * 0.05);
  const giftCost = giftWrap ? 300 : 0;
  const shipping = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + giftCost + shipping;
  const isEmpty = items.length === 0;

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-2xl transition-all duration-200 hover:opacity-70"
          >
            ←
          </button>
          <h1 className="flex-1 text-3xl font-bold text-[#0D1B2A]">🛒 カート</h1>
          {!isEmpty && <span className="text-sm text-[#9CA3AF]">{items.length}件</span>}
        </div>

        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="mb-6 text-8xl">🐾</div>
              <p className="mb-2 text-xl font-bold text-[#0D1B2A]">カートは空です</p>
              <p className="mb-8 text-sm text-[#9CA3AF]">お気に入りのグッズを追加しましょう</p>
              <Link
                href="/goods"
                className="shadow-accent/20 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-8 py-3 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                グッズを見る
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Cart Items */}
              <div className="mb-6 space-y-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex gap-3">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold">{item.name}</p>
                            {item.variant && (
                              <p className="text-xs text-gray-400">{item.variant}</p>
                            )}
                            <p className="text-accent mt-1 text-sm font-bold">
                              ¥{item.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-lg text-gray-300 transition-all duration-200 hover:text-[#E63946]"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-1">
                            <button
                              onClick={() => handleQuantity(item.id, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-[#4B5563] transition-all duration-200 hover:bg-gray-200 hover:text-[#0D1B2A] active:scale-[0.92]"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#0D1B2A]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantity(item.id, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-[#4B5563] transition-all duration-200 hover:bg-gray-200 hover:text-[#0D1B2A] active:scale-[0.92]"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-bold">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Gift Wrapping */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="h-5 w-5 rounded accent-[#2A9D8F]"
                  />
                  <span className="flex-1 text-sm font-medium">🎁 ギフトラッピング</span>
                  <span className="text-accent text-sm font-bold">¥300</span>
                </label>
              </motion.div>

              {/* Donation Display */}
              {subtotal > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <p className="text-sm font-bold text-emerald-700">
                        この注文で¥{donationAmount.toLocaleString()}が保護施設に届きます
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-600">
                        購入額の5%がNPO法人アニマルレスキュー福岡へ寄付されます
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="space-y-3 text-base text-[#4B5563]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">小計</span>
                    <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ギフトラッピング</span>
                      <span className="font-medium">¥300</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">送料</span>
                    {shipping === 0 ? (
                      <span className="font-bold text-green-500">無料 🎉</span>
                    ) : (
                      <span className="font-medium">¥{shipping.toLocaleString()}</span>
                    )}
                  </div>
                  {subtotal > 0 && subtotal < 5000 && (
                    <p className="text-right text-xs text-gray-400">
                      あと¥{(5000 - subtotal).toLocaleString()}で送料無料！
                    </p>
                  )}
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">🌟 寄付額</span>
                    <span className="font-bold">¥{donationAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-lg font-bold text-[#0D1B2A]">合計</span>
                    <span className="text-accent text-2xl font-extrabold">
                      ¥{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <button
                  onClick={() => router.push("/checkout")}
                  disabled={isEmpty}
                  className="shadow-accent/20 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  レジに進む
                </button>
                <Link
                  href="/goods"
                  className="block py-2 text-center text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:opacity-80"
                >
                  🛍️ 買い物を続ける
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function CartPage() {
  return (
    <AuthGate>
      <CartContent />
    </AuthGate>
  );
}
