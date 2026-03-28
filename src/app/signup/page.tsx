"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { isLoggedIn, loaded, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [petName, setPetName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Already logged in -> redirect to authRedirect or /mypage
  useEffect(() => {
    if (loaded && isLoggedIn) {
      const redirect = sessionStorage.getItem("authRedirect");
      sessionStorage.removeItem("authRedirect");
      router.replace(redirect || "/home");
    }
  }, [loaded, isLoggedIn, router]);

  const handleSignup = () => {
    login({ name: name || "ユーザー", petName: petName || "モカ" });
    const redirect = sessionStorage.getItem("authRedirect");
    sessionStorage.removeItem("authRedirect");
    router.push(redirect || "/home");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#2A9D8F]/5 via-white to-[#2A9D8F]/5 relative overflow-hidden">
      {/* Floating background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 text-4xl opacity-20"
        >
          🐾
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-40 right-10 text-3xl opacity-15"
        >
          🐶
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          className="absolute bottom-40 left-20 text-3xl opacity-15"
        >
          🐱
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
          className="absolute top-60 left-1/2 text-2xl opacity-10"
        >
          🌟
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-60 right-16 text-3xl opacity-10"
        >
          💚
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, delay: 3 }}
          className="absolute top-32 right-1/3 text-5xl opacity-10"
        >
          🐾
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="text-4xl mb-2"
          >
            🐾
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-accent font-bold tracking-wider mb-3"
          >
            YOLO
          </motion.p>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-bold text-[#0D1B2A] mb-2 leading-snug"
          >
            ベストショットを保存して、
            <br />
            動物を救おう
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#4B5563] text-sm"
          >
            YOLOに参加しよう
          </motion.p>
        </div>

        {/* Social login buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={handleSignup}
            className="w-full py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 mb-3"
          >
            <span className="font-bold text-lg">G</span> Googleで続ける
          </button>
          <button
            onClick={handleSignup}
            className="w-full py-3 rounded-xl bg-black text-white font-medium flex items-center justify-center gap-3 hover:bg-gray-900 hover:shadow-sm transition-all duration-200 mb-3"
          >
            <span className="text-lg"></span> Appleで続ける
          </button>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">または</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email/Password form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 mb-4"
        >
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-3 rounded-xl border-2 border-[#2A9D8F] text-[#2A9D8F] text-sm font-medium hover:bg-[#F0FDFB] transition-all duration-200"
            >
              メールアドレスで登録
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="お名前"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm transition-all duration-200"
              />
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="ペットの名前"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm transition-all duration-200"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm transition-all duration-200"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm transition-all duration-200"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSignup}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold text-base shadow-md shadow-accent/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                登録
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Donation message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4"
        >
          <p className="text-xs text-emerald-700 text-center leading-relaxed font-medium">
            🌟 YOLOでは会員の活動が保護施設への寄付につながります
          </p>
        </motion.div>

        {/* Terms text */}
        <p className="text-[10px] text-gray-400 text-center mb-4 leading-relaxed">
          登録することで、
          <span className="text-accent">利用規約</span>
          と
          <span className="text-accent">プライバシーポリシー</span>
          に同意します
        </p>

        {/* Skip button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-all duration-200 py-2"
        >
          あとで
        </motion.button>
      </motion.div>
    </div>
  );
}
