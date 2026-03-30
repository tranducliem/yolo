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
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (isLoggedIn) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#2A9D8F]/5 via-white to-[#2A9D8F]/5 px-4">
      {/* Floating background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
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
          className="absolute right-16 bottom-60 text-3xl opacity-10"
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
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-md"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="mb-2 text-4xl"
          >
            🐾
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-accent mb-3 text-sm font-bold tracking-wider"
          >
            YOLO
          </motion.p>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-2 text-xl leading-snug font-bold text-[#0D1B2A]"
          >
            ベストショットを保存して、
            <br />
            動物を救おう
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-[#4B5563]"
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
            className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
          >
            <span className="text-lg font-bold">G</span> Googleで続ける
          </button>
          <button
            onClick={handleSignup}
            className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-black py-3 font-medium text-white transition-all duration-200 hover:bg-gray-900 hover:shadow-sm"
          >
            <span className="text-lg"></span> Appleで続ける
          </button>
        </motion.div>

        {/* Divider */}
        <div className="mb-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">または</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Email/Password form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-4 space-y-3"
        >
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full rounded-xl border-2 border-[#2A9D8F] py-3 text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:bg-[#F0FDFB]"
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
                className="focus:ring-accent/50 focus:border-accent w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              />
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="ペットの名前"
                className="focus:ring-accent/50 focus:border-accent w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス"
                className="focus:ring-accent/50 focus:border-accent w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="focus:ring-accent/50 focus:border-accent w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSignup}
                className="shadow-accent/20 h-12 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
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
          className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3"
        >
          <p className="text-center text-xs leading-relaxed font-medium text-emerald-700">
            🌟 YOLOでは会員の活動が保護施設への寄付につながります
          </p>
        </motion.div>

        {/* Terms text */}
        <p className="mb-4 text-center text-[10px] leading-relaxed text-gray-400">
          登録することで、
          <span className="text-accent">利用規約</span>と
          <span className="text-accent">プライバシーポリシー</span>
          に同意します
        </p>

        {/* Skip button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="w-full py-2 text-center text-sm text-gray-400 transition-all duration-200 hover:text-gray-600"
        >
          あとで
        </motion.button>
      </motion.div>
    </div>
  );
}
