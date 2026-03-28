"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem } from "@/lib/mockData";
import AuthGate from "@/components/AuthGate";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

type ShippingMethod = "standard" | "express";
type PaymentMethod = "credit" | "convenience" | "bank";

function CheckoutContent() {
  const { loaded, getCart, clearCart } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Shipping form
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Paw Points
  const [usePawPoints, setUsePawPoints] = useState(false);

  const syncCart = useCallback(() => {
    setItems(getCart());
  }, [getCart]);

  useEffect(() => {
    if (loaded) syncCart();
  }, [loaded, syncCart]);

  const subtotal = items.reduce((s, c) => s + c.price * c.quantity, 0);
  const isFreeShipping = subtotal >= 5000;
  const shippingCost = shippingMethod === "express"
    ? (isFreeShipping ? 700 : 1200)
    : (isFreeShipping ? 0 : 500);
  const pawDiscount = usePawPoints ? 100 : 0;
  const total = Math.max(0, subtotal + shippingCost - pawDiscount);
  const donationAmount = Math.ceil(subtotal * 0.05);

  const handleOrder = () => {
    clearCart();
    router.push("/order-complete");
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30 focus:border-[#2A9D8F] focus:bg-white transition-all duration-200";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-2xl hover:opacity-70 transition-all duration-200">←</button>
          <h1 className="text-3xl font-bold text-[#0D1B2A]">お支払い</h1>
        </div>

        {/* Order Summary (Collapsible) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 mb-4 overflow-hidden"
        >
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full flex items-center justify-between p-5 transition-all duration-200"
          >
            <span className="font-bold text-sm">
              注文内容（{items.length}点）
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-accent">
                ¥{subtotal.toLocaleString()}
              </span>
              <motion.span
                animate={{ rotate: summaryOpen ? 180 : 0 }}
                className="text-gray-400"
              >
                ▼
              </motion.span>
            </div>
          </button>
          <AnimatePresence>
            {summaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 pt-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold">
                        ¥{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-4"
        >
          <h2 className="text-lg font-bold text-[#0D1B2A] mb-4">📍 お届け先</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#9CA3AF] font-medium mb-1 block">氏名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-[#9CA3AF] font-medium mb-1 block">〒 郵便番号</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="123-4567"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-[#9CA3AF] font-medium mb-1 block">住所</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="東京都渋谷区..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-[#9CA3AF] font-medium mb-1 block">電話番号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090-1234-5678"
                className={inputClass}
              />
            </div>
          </div>
        </motion.div>

        {/* Shipping Method */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-4"
        >
          <h2 className="text-lg font-bold text-[#0D1B2A] mb-4">🚚 配送方法</h2>
          <div className="space-y-3">
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                shippingMethod === "standard"
                  ? "border-accent bg-accent/5"
                  : "border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="shipping"
                checked={shippingMethod === "standard"}
                onChange={() => setShippingMethod("standard")}
                className="accent-[#2A9D8F]"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">🚚 通常配送（3-7日）</p>
                <p className="text-xs text-gray-400">ヤマト運輸</p>
              </div>
              <div className="text-right">
                {isFreeShipping ? (
                  <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    無料
                  </span>
                ) : (
                  <span className="font-bold text-sm">¥500</span>
                )}
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                shippingMethod === "express"
                  ? "border-accent bg-accent/5"
                  : "border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="shipping"
                checked={shippingMethod === "express"}
                onChange={() => setShippingMethod("express")}
                className="accent-[#2A9D8F]"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">🚀 お急ぎ便（1-3日）</p>
                <p className="text-xs text-gray-400">速達便</p>
              </div>
              <span className="font-bold text-sm">
                ¥{isFreeShipping ? "700" : "1,200"}
              </span>
            </label>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-4"
        >
          <h2 className="text-lg font-bold text-[#0D1B2A] mb-4">💰 お支払い方法</h2>
          <div className="space-y-3">
            {/* Credit Card */}
            <label
              className={`block p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                paymentMethod === "credit"
                  ? "border-accent bg-accent/5"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "credit"}
                  onChange={() => setPaymentMethod("credit")}
                  className="accent-[#2A9D8F]"
                />
                <span className="font-medium text-sm">💳 クレジットカード</span>
              </div>
              <AnimatePresence>
                {paymentMethod === "credit" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2 pl-7">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="カード番号 0000 0000 0000 0000"
                        className={inputClass}
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </label>

            {/* Convenience Store */}
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                paymentMethod === "convenience"
                  ? "border-accent bg-accent/5"
                  : "border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "convenience"}
                onChange={() => setPaymentMethod("convenience")}
                className="accent-[#2A9D8F]"
              />
              <span className="font-medium text-sm">📱 コンビニ払い</span>
            </label>

            {/* Bank Transfer */}
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                paymentMethod === "bank"
                  ? "border-accent bg-accent/5"
                  : "border-gray-100"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
                className="accent-[#2A9D8F]"
              />
              <span className="font-medium text-sm">🏦 銀行振込</span>
            </label>
          </div>
        </motion.div>

        {/* Paw Points */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-4"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setUsePawPoints(!usePawPoints)}
              className={`w-12 h-7 rounded-full flex items-center px-0.5 cursor-pointer transition-all duration-200 ${
                usePawPoints ? "bg-accent" : "bg-gray-200"
              }`}
            >
              <motion.div
                animate={{ x: usePawPoints ? 20 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-sm"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">🐾 100 Paw Pointsを使う</p>
              <p className="text-xs text-gray-400">-¥100 割引</p>
            </div>
          </label>
        </motion.div>

        {/* Donation Confirmation */}
        {subtotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-4 border border-emerald-100"
          >
            <div className="flex items-start gap-3">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                className="text-2xl"
              >
                🌟
              </motion.span>
              <div>
                <p className="font-bold text-sm text-emerald-700">
                  寄付額: ¥{donationAmount.toLocaleString()}（この注文の5%）
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  NPO法人アニマルレスキュー福岡へ届けられます
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-1">
                    {["🐕", "🐈", "🐾"].map((e, i) => (
                      <span key={i} className="text-sm">{e}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-emerald-500">
                    保護施設の動物たちの食事・医療費に充てられます
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-6"
        >
          <div className="space-y-2 text-base text-[#4B5563]">
            <div className="flex justify-between">
              <span className="text-gray-500">小計</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">送料</span>
              {shippingCost === 0 ? (
                <span className="text-green-500 font-bold">無料</span>
              ) : (
                <span>¥{shippingCost.toLocaleString()}</span>
              )}
            </div>
            {usePawPoints && (
              <div className="flex justify-between text-green-600">
                <span>Paw Points割引</span>
                <span>-¥100</span>
              </div>
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

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <button
            onClick={handleOrder}
            disabled={items.length === 0}
            className="w-full bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            🌟 注文を確定して動物を救う
          </button>
          <p className="text-center text-sm text-[#9CA3AF] mt-3">
            🔒 SSL暗号化で保護されています
          </p>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGate>
      <CheckoutContent />
    </AuthGate>
  );
}
