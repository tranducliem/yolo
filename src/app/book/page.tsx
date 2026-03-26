"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, mockBookTemplates } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

const me = mockPets[0];

export default function BookPage() {
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<number[]>([]);
  const [tpl, setTpl] = useState<string | null>(null);
  const [inclIllust, setInclIllust] = useState(false);
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [email, setEmail] = useState("");

  const template = mockBookTemplates.find((t) => t.id === tpl);
  const toggle = (i: number) => setSel((p) => p.includes(i) ? p.filter((x) => x !== i) : p.length < 20 ? [...p, i] : p);

  type Page = { type: "cover"; title: string; sub: string } | { type: "photo"; url: string; comment: string; date: string } | { type: "end"; text: string };
  const pages: Page[] = [
    { type: "cover", title: `${me.name}のフォトブック`, sub: "tomoni Book" },
    ...sel.map((idx) => ({ type: "photo" as const, url: me.photos[idx], comment: "AIが選んだベストショット", date: "2026年3月" })),
    { type: "end", text: `${me.name}と過ごした47日間の記録` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-center mb-2">📖 tomoni Book</h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          {["①写真選択", "②テンプレート", "③プレビュー"].map((l, i) => <span key={i} className={`text-xs font-bold ${step > i ? "text-accent" : "text-gray-400"}`}>{l}</span>)}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-gray-600 mb-2">{sel.length}枚選択中（8枚以上で注文可能）</p>
            <div className="grid grid-cols-3 gap-1 mb-4">
              {me.photos.map((url, i) => (
                <div key={i} className={`aspect-square rounded-lg overflow-hidden cursor-pointer relative ${sel.includes(i) ? "ring-4 ring-accent" : ""}`} onClick={() => toggle(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {sel.includes(i) && <div className="absolute top-1 right-1 bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{sel.indexOf(i) + 1}</div>}
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 mb-4 text-sm"><input type="checkbox" checked={inclIllust} onChange={(e) => setInclIllust(e.target.checked)} className="accent-accent" />イラスト版も含める</label>
            <button onClick={() => setStep(2)} disabled={sel.length < 8} className="w-full py-3 rounded-xl bg-accent text-white font-bold disabled:opacity-40">次へ（{sel.length}枚）</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 mb-4">
              {mockBookTemplates.map((t) => (
                <motion.div key={t.id} whileTap={{ scale: 0.95 }} className={`flex-shrink-0 w-48 p-4 rounded-2xl bg-white shadow-sm cursor-pointer ${tpl === t.id ? "ring-4 ring-accent scale-105" : ""}`} onClick={() => setTpl(t.id)}>
                  <div className="text-4xl text-center mb-2">{t.emoji}</div><p className="font-bold text-center">{t.name}</p>
                  <p className="text-xs text-gray-500 text-center mt-1">{t.description}</p><p className="text-center text-accent font-bold mt-2">¥{t.price.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
            <button onClick={() => setStep(3)} disabled={!tpl} className="w-full py-3 rounded-xl bg-accent text-white font-bold disabled:opacity-40">プレビューを見る</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-4 min-h-[300px] flex flex-col items-center justify-center">
              {pages[page]?.type === "cover" && <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={me.imageUrl} alt="" className="w-40 h-40 rounded-xl object-cover mx-auto mb-4 shadow" />
                <h2 className="text-xl font-bold">{(pages[page] as { title: string }).title}</h2><p className="text-sm text-gray-500 mt-1">{(pages[page] as { sub: string }).sub}</p>
              </div>}
              {pages[page]?.type === "photo" && <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={(pages[page] as { url: string }).url} alt="" className="w-full max-w-[250px] aspect-square rounded-xl object-cover mx-auto mb-3" />
                <p className="text-sm text-gray-600">{(pages[page] as { comment: string }).comment}</p><p className="text-xs text-gray-400 mt-1">{(pages[page] as { date: string }).date}</p>
              </div>}
              {pages[page]?.type === "end" && <div className="text-center py-8"><p className="text-4xl mb-4">🐾</p><p className="text-lg font-bold text-gray-700">{(pages[page] as { text: string }).text}</p></div>}
            </div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 rounded-xl bg-gray-100 text-sm disabled:opacity-30">← 前</button>
              <span className="text-sm text-gray-500">{page + 1} / {pages.length}</span>
              <button onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} disabled={page === pages.length - 1} className="px-4 py-2 rounded-xl bg-gray-100 text-sm disabled:opacity-30">次 →</button>
            </div>
            <button onClick={() => isLoggedIn ? setModal(true) : setAuthModal(true)} className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg shadow-lg">📖 注文する ¥{template?.price.toLocaleString()}</button>
            <label className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600"><input type="checkbox" className="accent-accent" />🎁 ギフトとして贈る</label>
          </motion.div>
        )}

        <AnimatePresence>
          {modal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4" onClick={() => setModal(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                <p className="text-4xl mb-2">🎉</p><h3 className="text-xl font-bold">Coming Soon!</h3><p className="text-sm text-gray-500 mt-2 mb-4">リリース時にお知らせします</p>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3" />
                <button onClick={() => setModal(false)} className="w-full py-3 rounded-xl bg-accent text-white font-bold">登録する</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="book" />
    </div>
  );
}
