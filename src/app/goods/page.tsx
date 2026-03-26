"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { mockPets, mockGoods } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

const me = mockPets[0];

export default function GoodsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [photo, setPhoto] = useState(me.imageUrl);
  const [cat, setCat] = useState<"2d" | "3d" | "book">("2d");
  const [detail, setDetail] = useState<string | null>(null);
  const [coming, setComing] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [email, setEmail] = useState("");

  const items = mockGoods.filter((g) => g.category === cat);
  const item = mockGoods.find((g) => g.id === detail);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-6">
        <div className="text-center mb-6"><h1 className="text-2xl font-bold">🎁 tomoni Goods</h1><p className="text-gray-500 text-sm">ベストショットをカタチに</p></div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-2">
          {me.photos.map((url, i) => (
            <div key={i} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer ${photo === url ? "ring-4 ring-accent" : ""}`} onClick={() => setPhoto(url)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {([["2d", "2Dグッズ"], ["3d", "3Dフィギュア"], ["book", "フォトブック"]] as const).map(([id, l]) => (
            <button key={id} onClick={() => id === "book" ? router.push("/book") : setCat(id)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${cat === id ? "bg-accent text-white" : "bg-white text-gray-600"}`}>{l}</button>
          ))}
        </div>

        {cat === "2d" && (
          <div className="grid grid-cols-2 gap-3">
            {items.map((g) => (
              <motion.div key={g.id} whileTap={{ scale: 0.95 }} className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer" onClick={() => setDetail(g.id)}>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3 flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="w-3/4 h-3/4 object-cover rounded-lg" />
                  <div className="absolute top-2 right-2 text-2xl">{g.emoji}</div>
                </div>
                <p className="font-bold text-sm">{g.name}</p><p className="text-accent font-bold">¥{g.price.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        )}

        {cat === "3d" && (
          <div className="space-y-4">
            {items.map((g) => (
              <motion.div key={g.id} whileTap={{ scale: 0.98 }} className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer" onClick={() => setDetail(g.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  </div>
                  <div className="flex-1"><p className="font-bold">{g.emoji} {g.name}</p><p className="text-xs text-gray-500">{g.description}</p><p className="text-xs text-gray-400 mt-1">サイズ: {g.size}</p><p className="text-accent font-bold mt-1">¥{g.price.toLocaleString()}</p></div>
                </div>
                {g.id === "g9" && <div className="mt-2 bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full inline-block">写真5枚以上で精度UP！</div>}
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {detail && item && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4" onClick={() => setDetail(null)}>
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                <div className="text-5xl mb-2">{item.emoji}</div><h3 className="text-xl font-bold">{item.name}</h3><p className="text-gray-500 text-sm mt-1">{item.description}</p><p className="text-accent text-2xl font-bold mt-2">¥{item.price.toLocaleString()}</p>
                <div className="aspect-square rounded-xl bg-gray-100 my-4 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="w-3/4 h-3/4 object-cover rounded-lg" />
                </div>
                <button onClick={() => { setDetail(null); if (!isLoggedIn) { setAuthModal(true); } else { setComing(true); } }} className="w-full py-3 rounded-xl bg-accent text-white font-bold">注文する</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {coming && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4" onClick={() => setComing(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                <p className="text-4xl mb-2">🎉</p><h3 className="text-xl font-bold">Coming Soon!</h3><p className="text-sm text-gray-500 mt-2 mb-4">リリース時にお知らせします</p>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3" />
                <button onClick={() => setComing(false)} className="w-full py-3 rounded-xl bg-accent text-white font-bold">登録する</button>
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
