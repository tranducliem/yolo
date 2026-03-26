"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { clearSessionData } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import type { ResultItem } from "@/lib/types";

function Stars({ n, color }: { n: number; color: string }) {
  return <span className="text-sm tracking-wider">{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < n ? color : "text-gray-300"}>★</span>)}</span>;
}

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div key={i}
          initial={{ x: `${(i * 37) % 100}%`, y: "-10%", opacity: 1 }}
          animate={{ y: "110%", opacity: 0, rotate: 360 }}
          transition={{ duration: 2 + (i % 3), delay: (i % 7) * 0.3, repeat: Infinity }}
          style={{ width: 4 + (i % 8), height: 4 + (i % 8), backgroundColor: ["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#FFA07A"][i % 5], position: "absolute" }}
          className="rounded-full" />
      ))}
    </div>
  );
}

type Phase = "dark" | "countdown" | "reveal";

export default function ResultsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [phase, setPhase] = useState<Phase>("dark");
  const [cd, setCd] = useState(3);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [petName, setPetName] = useState("");
  const [revealed, setRevealed] = useState(0);
  const [showCta, setShowCta] = useState(false);
  const [authModal, setAuthModal] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("tomoni_results");
    if (!raw) { router.push("/try"); return; }
    const d = JSON.parse(raw);
    setPetName(d.petName); setResults(d.results);
    setTimeout(() => setPhase("countdown"), 1000);
  }, [router]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (cd <= 0) { setPhase("reveal"); return; }
    const t = setTimeout(() => setCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, cd]);

  useEffect(() => {
    if (phase !== "reveal") return;
    if (revealed >= results.length) { setTimeout(() => setShowCta(true), 1000); return; }
    const t = setTimeout(() => setRevealed((c) => c + 1), revealed === 0 ? 500 : 1000);
    return () => clearTimeout(t);
  }, [phase, revealed, results.length]);

  const share = async () => {
    if (navigator.share) try { await navigator.share({ title: `${petName}のベストショット`, text: `${petName}のベストショットをAIが選びました！` }); } catch {}
  };

  const rankStyle = (r: number) => r === 1 ? "rainbow-border shadow-2xl" : r === 2 ? "border-4 border-gold shadow-xl" : "border-4 border-gray-400 shadow-lg";
  const rankSize = (r: number) => r === 1 ? "w-72 h-72 md:w-80 md:h-80" : r === 2 ? "w-56 h-56 md:w-64 md:h-64" : "w-48 h-48 md:w-56 md:h-56";

  if (phase === "dark") return <div className="flex items-center justify-center min-h-screen bg-black"><p className="text-white/30 animate-pulse">結果を準備中...</p></div>;
  if (phase === "countdown") return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <motion.span key={cd} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.3, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.8 }}
          className="text-8xl font-bold text-white">{cd > 0 ? cd : ""}</motion.span>
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/5 to-white px-4 py-8 relative overflow-hidden">
      <Particles />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8 relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold">🎉 {petName}のベストショット TOP3</h1>
        <p className="text-gray-500 text-sm mt-1">AIが厳選した最高の瞬間</p>
      </motion.div>

      <div className="flex flex-col items-center gap-6 relative z-10 max-w-md md:max-w-lg mx-auto">
        {results.map((r, i) => (
          <motion.div key={r.rank} initial={{ opacity: 0, y: 40 }} animate={i < revealed ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="w-full">
            <div className={`relative rounded-2xl overflow-hidden bg-white mx-auto ${rankStyle(r.rank)}`}>
              <div className={`${rankSize(r.rank)} mx-auto`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.dataUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-3 left-3 z-10">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${r.rank === 1 ? "bg-gradient-to-r from-rose-500 via-amber-500 to-violet-500 text-white" : r.rank === 2 ? "bg-gold text-white" : "bg-gray-400 text-white"}`}>
                  {r.rank === 1 ? "👑 1st" : r.rank === 2 ? "🥈 2nd" : "🥉 3rd"}
                </span>
              </div>
              <div className="p-4">
                <p className="text-gray-700 font-medium mb-3">💬 {r.comment}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span>😊笑顔 <Stars n={r.smileScore} color="text-gold" /></span>
                  <span>💕愛情 <Stars n={r.loveScore} color="text-pink-400" /></span>
                  <span>✨レア <Stars n={r.rareScore} color="text-accent" /></span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCta && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-8 space-y-3 relative z-10">
            <button onClick={share} className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg shadow-lg shadow-accent/25">💝 家族に送る</button>
            <button className="w-full py-3 rounded-xl border-2 border-accent text-accent font-bold">📤 SNSに投稿</button>
            <button onClick={() => isLoggedIn ? router.push("/goods") : setAuthModal("goods")}
              className="w-full py-3 rounded-xl border-2 border-gold text-gold font-bold">🎁 グッズにする</button>
            <button onClick={() => { sessionStorage.removeItem("tomoni_results"); clearSessionData(); router.push("/try"); }}
              className="w-full py-2 text-sm text-gray-400">🔄 もう一度選ぶ</button>

            {/* Save banner for non-logged-in */}
            {!isLoggedIn && (
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-6 text-center border border-accent/20 mt-6">
                <h3 className="font-bold text-lg mb-2">✨ この結果を保存してもっと楽しもう</h3>
                <p className="text-gray-500 text-sm mb-4">フォトブック・グッズ・毎日のベストショット...</p>
                <Link href="/signup" className="inline-block px-8 py-3 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25">
                  無料で登録する
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={!!authModal} onClose={() => setAuthModal(null)} trigger={authModal || "default"} />
    </div>
  );
}
