"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { goods2D, goods3D } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import ProductMockup from "@/components/ProductMockup";
import type { MockupType } from "@/components/ProductMockup";

type Category = "2d" | "3d";

/** Map goods id → mockup type */
function toMockupType(id: string): MockupType {
  const map: Record<string, MockupType> = {
    "goods-acrylic": "acrylic",
    "goods-mug": "mug",
    "goods-tshirt": "tshirt",
    "goods-phonecase": "phonecase",
    "goods-cushion": "cushion",
    "goods-towel": "towel",
    "goods-figure-mini": "figure-mini",
    "goods-figure-standard": "figure-standard",
    "goods-figure-premium": "figure-premium",
  };
  return map[id] ?? "acrylic";
}

export default function GoodsPage() {
  const { isLoggedIn, addToCart } = useAuth();
  const router = useRouter();
  const [cat, setCat] = useState<Category>("2d");
  const [detail, setDetail] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);

  const allItems = [...goods2D, ...goods3D];
  const detailItem = allItems.find((g) => g.id === detail);

  const handleAddToCart = () => {
    if (!detailItem) return;
    if (!isLoggedIn) {
      setDetail(null);
      setAuthModal(true);
      return;
    }
    addToCart({
      goodsId: detailItem.id,
      name: detailItem.name,
      price: detailItem.price,
      quantity: 1,
      imageUrl: detailItem.imageUrl,
    });
    setDetail(null);
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-[#0D1B2A]">YOLO Goods</h1>
          <p className="text-sm text-[#9CA3AF]">ベストショットをカタチに</p>
        </motion.div>

        {/* Donation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2"
        >
          <span className="text-lg">🌟</span>
          <p className="text-xs text-emerald-700 font-medium">
            購入額の5%が保護施設に届きます
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/book")}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm transition-all duration-200"
          >
            📖 フォトブック
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCat("2d")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              cat === "2d"
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            🎨 2Dグッズ
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCat("3d")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              cat === "3d"
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            🏆 3Dフィギュア
          </motion.button>
        </motion.div>

        {/* 2D goods - 2 col grid */}
        {cat === "2d" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            {goods2D.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setDetail(g.id)}
              >
                <ProductMockup type={toMockupType(g.id)} />
                <div className="p-3">
                  <p className="font-bold text-sm text-[#0D1B2A]">{g.name}</p>
                  <p className="text-[11px] text-gray-400">{g.size}</p>
                  <p className="text-accent font-bold text-base mt-1">
                    ¥{g.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-1">
                    🌟 ¥{Math.floor(g.price * 0.05).toLocaleString()}が寄付に
                  </p>
                  <p className="text-[10px] text-gray-300 mt-1 truncate">
                    提供: {g.partner.split("（")[0]}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 3D goods - 1 col large cards */}
        {cat === "3d" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 mb-6"
          >
            {goods3D.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setDetail(g.id)}
              >
                <ProductMockup type={toMockupType(g.id)} />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg text-[#0D1B2A]">{g.name}</p>
                      <p className="text-sm text-[#4B5563] mt-0.5">{g.description}</p>
                      <p className="text-xs text-gray-400 mt-1">サイズ: {g.size}</p>
                    </div>
                    <p className="text-accent font-bold text-xl whitespace-nowrap ml-3">
                      ¥{g.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-emerald-600">
                      🌟 ¥{Math.floor(g.price * 0.05).toLocaleString()}が寄付に
                    </p>
                    <p className="text-[11px] text-gray-300">提供: {g.partner}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Book link card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/book">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-3xl">📖</span>
              <div className="flex-1">
                <p className="font-bold text-sm">フォトブックも作れます</p>
                <p className="text-xs text-gray-500">¥980〜 / Photoback（MONO-LINK）提供</p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Link>
        </motion.div>

        {/* Detail modal */}
        <AnimatePresence>
          {detail && detailItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4"
              onClick={() => setDetail(null)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden"
              >
                <ProductMockup type={toMockupType(detailItem.id)} />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0D1B2A]">{detailItem.name}</h3>
                  <p className="text-sm text-[#4B5563] mt-1">{detailItem.description}</p>
                  <p className="text-xs text-gray-400 mt-1">サイズ: {detailItem.size}</p>
                  <p className="text-accent text-2xl font-bold mt-2">
                    ¥{detailItem.price.toLocaleString()}
                  </p>

                  {/* Donation info */}
                  <div className="bg-emerald-50 rounded-xl p-3 my-3 flex items-center gap-2">
                    <span className="text-sm">🌟</span>
                    <p className="text-xs text-emerald-700 font-medium">
                      購入額の5%（¥{Math.floor(detailItem.price * 0.05).toLocaleString()}）が寄付に
                    </p>
                  </div>

                  <p className="text-[11px] text-gray-400 mb-3">提供: {detailItem.partner}</p>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold h-12 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    🛒 カートに入れる
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="goods" />
    </div>
  );
}
