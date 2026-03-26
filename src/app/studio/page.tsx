"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { mockPets, studioStyles } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

const me = mockPets[0];

export default function StudioPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [slider, setSlider] = useState(50);
  const styleObj = studioStyles.find((s) => s.id === style);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-6">
        <div className="text-center mb-6"><h1 className="text-2xl font-bold">✨ tomoni Studio</h1><p className="text-gray-500 text-sm">ベストショットを作品に変える</p></div>
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-accent text-white" : "bg-gray-200 text-gray-400"}`}>{s}</div>)}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-bold mb-3">写真を選択</h2>
            <div className="grid grid-cols-3 gap-1 mb-4">
              {me.photos.map((url, i) => (
                <div key={i} className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${photo === url ? "ring-4 ring-accent" : ""}`} onClick={() => setPhoto(url)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button onClick={() => photo && setStep(2)} disabled={!photo} className="w-full py-3 rounded-xl bg-accent text-white font-bold disabled:opacity-40">次へ</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-bold mb-3">スタイルを選択</h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 mb-4">
              {studioStyles.map((s) => (
                <div key={s.id} className={`flex-shrink-0 w-28 cursor-pointer ${style === s.id ? "ring-4 ring-accent rounded-xl" : ""}`} onClick={() => setStyle(s.id)}>
                  <div className="aspect-square rounded-xl overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo!} alt="" className="w-full h-full object-cover" style={{ filter: s.filter }} />
                    {style === s.id && <div className="absolute top-1 right-1 bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">✓</div>}
                  </div>
                  <p className="text-center text-xs font-medium mt-1">{s.emoji} {s.name}</p>
                </div>
              ))}
            </div>
            <button onClick={() => {
              if (!isLoggedIn) { setAuthModal(true); return; }
              setProcessing(true); setTimeout(() => { setProcessing(false); setDone(true); setStep(3); }, 3000);
            }} disabled={!style || processing}
              className="w-full py-3 rounded-xl bg-accent text-white font-bold disabled:opacity-40">{processing ? "✨ 変換中..." : "✨ イラスト化する"}</button>
          </motion.div>
        )}

        {step === 3 && done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-bold mb-3 text-center">Before / After</h2>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo!} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo!} alt="" className="w-full h-full object-cover" style={{ filter: styleObj?.filter }} />
              </div>
              <div className="absolute inset-0 flex items-center" style={{ left: `${slider}%` }}><div className="w-1 h-full bg-white shadow-lg" /></div>
              <input type="range" min="0" max="100" value={slider} onChange={(e) => setSlider(Number(e.target.value))} className="absolute bottom-4 left-4 right-4 z-10 accent-accent" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => router.push("/book")} className="py-3 rounded-xl bg-white border border-gray-200 text-sm font-medium">📖 フォトブック</button>
              <button onClick={() => router.push("/goods")} className="py-3 rounded-xl bg-white border border-gray-200 text-sm font-medium">🎁 グッズ</button>
              <button className="py-3 rounded-xl bg-accent text-white text-sm font-bold">💝 シェア</button>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="illustrate" />
    </div>
  );
}
