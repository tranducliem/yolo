"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";

interface Props {
  emotions: { happy: number; funny: number; touched: number; crying: number };
  likes: number;
  comments: number;
}

const cfg = [
  { key: "happy" as const, emoji: "😊" },
  { key: "funny" as const, emoji: "😂" },
  { key: "touched" as const, emoji: "🥺" },
  { key: "crying" as const, emoji: "😢" },
];

export default function EmotionButtons({ emotions, likes, comments }: Props) {
  const { isLoggedIn } = useAuth();
  const [counts, setCounts] = useState(emotions);
  const [likeCount, setLikeCount] = useState(likes);
  const [tapped, setTapped] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<string | null>(null);

  const tap = (k: string, trigger: string) => {
    if (!isLoggedIn) { setModal(trigger); return; }
    if (tapped[k]) return;
    setTapped((p) => ({ ...p, [k]: true }));
    if (k === "like") setLikeCount((c) => c + 1);
    else setCounts((c) => ({ ...c, [k]: c[k as keyof typeof c] + 1 }));
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {cfg.map(({ key, emoji }) => (
          <motion.button key={key} whileTap={{ scale: 1.3 }} onClick={() => tap(key, "emotion")}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${tapped[key] ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-600"}`}>
            <span>{emoji}</span><span className="text-xs">{counts[key]}</span>
          </motion.button>
        ))}
        <motion.button whileTap={{ scale: 1.3 }} onClick={() => tap("like", "like")}
          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${tapped.like ? "bg-red/10 text-red" : "bg-gray-100 text-gray-600"}`}>
          <span>❤️</span><span className="text-xs">{likeCount}</span>
        </motion.button>
        <button onClick={() => { if (!isLoggedIn) setModal("comment"); }}
          className="flex items-center gap-1 text-sm text-gray-400 px-2 py-1">
          💬 <span className="text-xs">{comments}</span>
        </button>
      </div>
      <AuthModal isOpen={!!modal} onClose={() => setModal(null)} trigger={modal || "default"} />
    </>
  );
}
