"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, availableTags } from "@/lib/mockData";
import AuthGate from "@/components/AuthGate";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

const me = mockPets[0];
const vis = [{ id: "public", i: "🌍", l: "全体公開" }, { id: "followers", i: "👥", l: "フォロワー" }, { id: "private", i: "🔒", l: "非公開" }];

export default function PostPage() {
  return <AuthGate><PostInner /></AuthGate>;
}

function PostInner() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [donate, setDonate] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [src, setSrc] = useState<"cam" | "best">("best");

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-4">📷 投稿する</h1>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setSrc("cam")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${src === "cam" ? "bg-accent text-white" : "bg-white text-gray-600"}`}>カメラロールから</button>
          <button onClick={() => setSrc("best")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${src === "best" ? "bg-accent text-white" : "bg-white text-gray-600"}`}>ベストショットから</button>
        </div>
        <div className="grid grid-cols-3 gap-1 mb-4">
          {me.photos.map((url, i) => (
            <div key={i} className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${photo === url ? "ring-4 ring-accent" : ""}`} onClick={() => setPhoto(url)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="w-full aspect-square rounded-2xl object-cover shadow-sm mb-4" />
        )}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 font-medium">キャプション</span><span className={caption.length > 200 ? "text-red" : "text-gray-400"}>{caption.length}/200</span></div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 200))} placeholder="今日の一枚について..." rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">タグ</p>
          <div className="flex flex-wrap gap-2">{availableTags.map((t) => <button key={t} onClick={() => setTags((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])} className={`px-3 py-1.5 rounded-full text-xs font-medium ${tags.includes(t) ? "bg-accent text-white" : "bg-white text-gray-600 border border-gray-200"}`}>{t}</button>)}</div>
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">公開範囲</p>
          <div className="flex gap-2">{vis.map((v) => <button key={v.id} onClick={() => setVisibility(v.id)} className={`flex-1 py-2 rounded-xl text-xs font-medium ${visibility === v.id ? "bg-accent text-white" : "bg-white text-gray-600"}`}>{v.i} {v.l}</button>)}</div>
        </div>
        <label className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm mb-6 cursor-pointer">
          <input type="checkbox" checked={donate} onChange={(e) => setDonate(e.target.checked)} className="w-5 h-5 accent-accent" />
          <div><p className="text-sm font-bold">寄付して投稿 🌟</p><p className="text-xs text-gray-500">10🐾が保護施設に寄付されます</p></div>
        </label>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setConfetti(true); setTimeout(() => router.push("/home"), 2500); }} disabled={!photo}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg shadow-lg disabled:opacity-40">投稿する</motion.button>

        <AnimatePresence>
          {confetti && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                <div className="text-5xl mb-4">🎉</div><p className="text-xl font-bold mb-2">投稿完了！</p><p className="text-accent font-bold text-lg">+10🐾 獲得！</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
