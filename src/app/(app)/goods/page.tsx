"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import ProductMockup from "@/components/features/shop/ProductMockup";
import type { MockupType } from "@/components/features/shop/ProductMockup";

type Category = "2d" | "3d";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string;
  donation_percent: number;
  partner: string;
  image_url: string | null;
}

/** Map product sku → mockup type */
function toMockupType(sku: string): MockupType {
  const map: Record<string, MockupType> = {
    "goods-acrylic": "acrylic",
    "goods-mug": "mug",
    "goods-tshirt": "tshirt",
    "goods-phonecase": "phonecase",
    "goods-cushion": "cushion",
    "goods-towel": "towel",
    "goods-figure-3cm": "figure-mini",
    "goods-figure-7cm": "figure-standard",
    "goods-figure-12cm": "figure-premium",
  };
  return map[sku] ?? "acrylic";
}

export default function GoodsPage() {
  const { isLoggedIn, addToCart } = useAuth();
  const router = useRouter();
  const [cat, setCat] = useState<Category>("2d");
  const [detail, setDetail] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [products2D, setProducts2D] = useState<Product[]>([]);
  const [products3D, setProducts3D] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?category=2d")
      .then((r) => r.json())
      .then((d) => setProducts2D(d.products || []))
      .catch(() => {});
    fetch("/api/products?category=3d")
      .then((r) => r.json())
      .then((d) => setProducts3D(d.products || []))
      .catch(() => {});
  }, []);

  const allItems = [...products2D, ...products3D];
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
      imageUrl: detailItem.image_url || "",
    });
    setDetail(null);
    router.push("/cart");
  };

  const items = cat === "2d" ? products2D : products3D;

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-bold text-[#0D1B2A]">YOLO Goods</h1>
          <p className="text-sm text-[#9CA3AF]">ベストショットをカタチに</p>
        </motion.div>

        {/* Donation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5"
        >
          <span className="text-lg">🌟</span>
          <p className="text-xs font-medium text-emerald-700">購入額の5%が保護施設に届きます</p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex gap-2"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/book")}
            className="flex-1 rounded-xl bg-white py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm"
          >
            📖 フォトブック
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCat("2d")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
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
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
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
            className="mb-6 grid grid-cols-2 gap-3"
          >
            {items.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setDetail(g.id)}
              >
                <ProductMockup type={toMockupType(g.sku)} />
                <div className="p-3">
                  <p className="text-sm font-bold text-[#0D1B2A]">{g.name}</p>
                  <p className="text-[11px] text-gray-400">{g.description}</p>
                  <p className="text-accent mt-1 text-base font-bold">
                    ¥{g.price.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[10px] text-emerald-600">
                    🌟 ¥{Math.floor(g.price * (g.donation_percent / 100)).toLocaleString()}が寄付に
                  </p>
                  <p className="mt-1 truncate text-[10px] text-gray-300">提供: {g.partner}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 3D goods - 1 col large cards */}
        {cat === "3d" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 space-y-4">
            {items.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setDetail(g.id)}
              >
                <ProductMockup type={toMockupType(g.sku)} />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold text-[#0D1B2A]">{g.name}</p>
                      <p className="mt-0.5 text-sm text-[#4B5563]">{g.description}</p>
                    </div>
                    <p className="text-accent ml-3 text-xl font-bold whitespace-nowrap">
                      ¥{g.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[11px] text-emerald-600">
                      🌟 ¥{Math.floor(g.price * (g.donation_percent / 100)).toLocaleString()}
                      が寄付に
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
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-3xl">📖</span>
              <div className="flex-1">
                <p className="text-sm font-bold">フォトブックも作れます</p>
                <p className="text-xs text-gray-500">¥1,980〜 / MONO-LINK提供</p>
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
              className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 px-4 pb-4 sm:items-center"
              onClick={() => setDetail(null)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
              >
                <ProductMockup type={toMockupType(detailItem.sku)} />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0D1B2A]">{detailItem.name}</h3>
                  <p className="mt-1 text-sm text-[#4B5563]">{detailItem.description}</p>
                  <p className="text-accent mt-2 text-2xl font-bold">
                    ¥{detailItem.price.toLocaleString()}
                  </p>

                  <div className="my-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
                    <span className="text-sm">🌟</span>
                    <p className="text-xs font-medium text-emerald-700">
                      購入額の{detailItem.donation_percent}%（¥
                      {Math.floor(
                        detailItem.price * (detailItem.donation_percent / 100),
                      ).toLocaleString()}
                      ）が寄付に
                    </p>
                  </div>

                  <p className="mb-3 text-[11px] text-gray-400">提供: {detailItem.partner}</p>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] py-3 font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    🛒 カートに入れる
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="goods" />
    </>
  );
}
