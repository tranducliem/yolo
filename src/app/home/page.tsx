"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { mockPets, mockPosts } from "@/lib/mockData";
import AuthGate from "@/components/AuthGate";
import EmotionButtons from "@/components/EmotionButtons";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

export default function HomePage() {
  return <AuthGate><HomeInner /></AuthGate>;
}

function HomeInner() {
  const router = useRouter();
  const [emoCount, setEmoCount] = useState(12847);
  const crown = mockPets[0];
  const feed = mockPosts.slice(0, 5);

  const [cd, setCd] = useState({ h: 14, m: 32, s: 7 });
  useEffect(() => {
    const iv = setInterval(() => setCd((p) => {
      let { h, m, s } = p; s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setEmoCount((c) => c + 1 + Math.floor(Math.random() * 3)), 1000);
    return () => clearInterval(iv);
  }, []);

  const cdStr = `${String(cd.h).padStart(2, "0")}:${String(cd.m).padStart(2, "0")}:${String(cd.s).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4 sticky top-0 bg-gray-50 z-40">
          <h1 className="text-2xl font-bold text-accent">🐾 tomoni</h1>
          <button className="relative"><span className="text-2xl">🔔</span><span className="absolute -top-1 -right-1 bg-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span></button>
        </div>

        {/* Crown */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-gold rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={crown.imageUrl} alt={crown.name} className="w-20 h-20 rounded-xl object-cover border-2 border-gold shadow" />
            <div className="flex-1">
              <p className="text-sm text-gold font-bold">👑 今日の1匹</p>
              <p className="text-lg font-bold">{crown.name}</p>
              <p className="text-xs text-gray-500">{crown.ownerName}</p>
            </div>
            <div className="text-right"><p className="text-xs text-gray-500">残り</p><p className="font-mono font-bold text-gold">{cdStr}</p></div>
          </div>
        </motion.div>

        {/* Dare */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-start justify-between mb-2">
            <div><p className="font-bold">🎯 今週のお題</p><p className="text-accent font-medium">#おやつタイム</p></div>
            <button className="px-4 py-2 bg-accent text-white text-sm rounded-xl font-bold">参加する</button>
          </div>
          <p className="text-xs text-gray-500">参加者 1,234人 | あと3日</p>
        </div>

        {/* Emotion counter */}
        <div className="text-center py-4 mb-4">
          <p className="text-sm text-gray-500">tomoniは今日</p>
          <motion.p key={emoCount} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="text-3xl font-bold text-accent">{emoCount.toLocaleString()}人</motion.p>
          <p className="text-sm text-gray-500">を笑顔にしました 😊</p>
        </div>

        {/* Recommended */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3"><h2 className="font-bold">あなたへのおすすめ</h2>
            <button onClick={() => router.push("/explore")} className="text-accent text-sm font-medium">もっと見る →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {mockPosts.slice(0, 3).map((p) => (
              <div key={p.id} className="flex-shrink-0 w-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className="w-32 h-32 rounded-xl object-cover" />
                <p className="text-xs font-medium mt-1 truncate">{p.petName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {feed.map((post) => (
            <motion.div key={post.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1"><p className="text-sm font-bold">{post.petName}</p><p className="text-xs text-gray-400">{post.ownerName} · {post.createdAt}</p></div>
                {post.isBoosted && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">🚀</span>}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt="" className="w-full aspect-square object-cover" />
              <div className="p-3">
                <EmotionButtons emotions={post.emotions} likes={post.likes} comments={post.comments} />
                <p className="text-sm mt-2">{post.caption}</p>
                <div className="flex gap-1 mt-1">{post.tags.map((t) => <span key={t} className="text-xs text-accent">{t}</span>)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
