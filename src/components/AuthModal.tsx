"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const MESSAGES: Record<string, string> = {
  like: "いいねするにはアカウントが必要です",
  follow: "フォローするにはアカウントが必要です",
  emotion: "リアクションするにはアカウントが必要です",
  comment: "コメントするにはアカウントが必要です",
  post: "投稿するにはアカウントが必要です",
  goods: "グッズを注文するにはアカウントが必要です",
  illustrate: "イラスト化するにはアカウントが必要です",
  book: "フォトブックを注文するにはアカウントが必要です",
  boost: "ブーストするにはアカウントが必要です",
  try: "もう一度試すにはアカウントが必要です",
  save: "結果を保存するにはアカウントが必要です",
  default: "tomoniに参加しよう",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trigger?: string;
}

export default function AuthModal({ isOpen, onClose, trigger = "default" }: Props) {
  const { login } = useAuth();
  const heading = MESSAGES[trigger] || MESSAGES.default;

  const handleSignup = () => {
    login({ name: "ユーザー", petName: "モカ" });
    onClose();
  };

  const goSignupPage = () => {
    sessionStorage.setItem("authRedirect", window.location.pathname);
    onClose();
    window.location.href = "/signup";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🐾</div>
              <p className="text-xs text-accent font-medium mb-2">tomoni</p>
              <h3 className="text-lg font-bold mb-2">{heading}</h3>
              <p className="text-sm text-gray-500">無料登録で、いいね・フォロー・投稿・グッズ注文ができます</p>
            </div>

            <button onClick={handleSignup}
              className="w-full py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 mb-3">
              <span className="font-bold text-lg">G</span> Googleで続ける
            </button>
            <button onClick={handleSignup}
              className="w-full py-3 rounded-xl bg-black text-white font-medium flex items-center justify-center gap-3 hover:bg-gray-900 mb-4">
              <span className="text-lg"></span> Appleで続ける
            </button>
            <button onClick={goSignupPage}
              className="w-full text-center text-sm text-accent font-medium mb-3 hover:underline">
              メールで登録
            </button>
            <button onClick={onClose}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600">あとで</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
