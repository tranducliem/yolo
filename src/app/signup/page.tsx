"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { isLoggedIn, loaded, login } = useAuth();

  // Already logged in → redirect to mypage
  useEffect(() => {
    if (loaded && isLoggedIn) router.replace("/mypage");
  }, [loaded, isLoggedIn, router]);

  const handleSignup = () => {
    login({ name: "ユーザー", petName: "モカ" });
    const redirect = sessionStorage.getItem("authRedirect");
    sessionStorage.removeItem("authRedirect");
    router.push(redirect || "/mypage");
  };

  if (loaded && isLoggedIn) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-accent/5 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🐾</div>
          <p className="text-xs text-accent font-medium mb-3">tomoni</p>
          <h1 className="text-2xl font-bold mb-2">tomoniに参加しよう</h1>
          <p className="text-gray-500 text-sm">いいね、フォロー、投稿ができるようになります</p>
        </div>
        <button onClick={handleSignup} className="w-full py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 mb-3">
          <span className="font-bold text-lg">G</span> Googleで続ける
        </button>
        <button onClick={handleSignup} className="w-full py-3 rounded-xl bg-black text-white font-medium flex items-center justify-center gap-3 hover:bg-gray-900 mb-6">
          <span className="text-lg"></span> Appleで続ける
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200" /><span className="text-sm text-gray-400">または</span><div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="space-y-3 mb-6">
          <input type="email" placeholder="メールアドレス" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <input type="password" placeholder="パスワード" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50" />
          <button onClick={handleSignup} className="w-full py-3 rounded-xl bg-accent text-white font-bold">登録</button>
        </div>
        <button onClick={() => router.back()} className="w-full text-center text-sm text-gray-400">あとで</button>
      </motion.div>
    </div>
  );
}
