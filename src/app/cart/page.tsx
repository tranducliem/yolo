"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem } from "@/types";
import AuthGate from "@/components/features/auth/AuthGate";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";

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
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-2xl hover:opacity-70 transition-all duration-200">←</button>
          <h1 className="text-3xl font-bold text-[#0D1B2A] flex-1">🛒 カート</h1>
          {!isEmpty && (
            <span className="text-sm text-[#9CA3AF]">{items.length}件</span>
          )}
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
              <div className="text-8xl mb-6">🐾</div>
              <p className="text-xl font-bold text-[#0D1B2A] mb-2">カートは空です</p>
              <p className="text-[#9CA3AF] text-sm mb-8">お気に入りのグッズを追加しましょう</p>
              <Link
                href="/goods"
                className="bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg shadow-accent/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
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
              <div className="space-y-3 mb-6">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-sm">{item.name}</p>
                            {item.variant && (
                              <p className="text-xs text-gray-400">{item.variant}</p>
                            )}
                            <p className="text-accent font-bold text-sm mt-1">
                              ¥{item.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-300 hover:text-[#E63946] transition-all duration-200 text-lg"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-1">
                            <button
                              onClick={() => handleQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5563] hover:bg-gray-200 hover:text-[#0D1B2A] font-bold transition-all duration-200 active:scale-[0.92]"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-[#0D1B2A]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5563] hover:bg-gray-200 hover:text-[#0D1B2A] font-bold transition-all duration-200 active:scale-[0.92]"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-sm">
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
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-4"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#2A9D8F]"
                  />
                  <span className="flex-1 font-medium text-sm">🎁 ギフトラッピング</span>
                  <span className="text-accent font-bold text-sm">¥300</span>
                </label>
              </motion.div>

              {/* Donation Display */}
              {subtotal > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-4 border border-emerald-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <p className="font-bold text-sm text-emerald-700">
                        この注文で¥{donationAmount.toLocaleString()}が保護施設に届きます
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5">
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
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-6"
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
                      <span className="text-green-500 font-bold">無料 🎉</span>
                    ) : (
                      <span className="font-medium">¥{shipping.toLocaleString()}</span>
                    )}
                  </div>
                  {subtotal > 0 && subtotal < 5000 && (
                    <p className="text-xs text-gray-400 text-right">
                      あと¥{(5000 - subtotal).toLocaleString()}で送料無料！
                    </p>
                  )}
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">🌟 寄付額</span>
                    <span className="font-bold">¥{donationAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-[#0D1B2A]">合計</span>
                    <span className="font-extrabold text-2xl text-accent">
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
                  className="w-full bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-accent/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  レジに進む
                </button>
                <Link
                  href="/goods"
                  className="block text-center text-[#2A9D8F] font-medium text-sm py-2 hover:opacity-80 transition-all duration-200"
                >
                  🛍️ 買い物を続ける
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGate>
      <CartContent />
    </AuthGate>
  );
}
