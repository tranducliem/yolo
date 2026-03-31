"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export default function SignupPage() {
  const router = useRouter();
  const { isLoggedIn, loaded, login, loginWithEmail, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [petName, setPetName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Already logged in -> redirect
  useEffect(() => {
    if (loaded && isLoggedIn) {
      const redirect = sessionStorage.getItem("authRedirect");
      sessionStorage.removeItem("authRedirect");
      router.replace(redirect || "/home");
    }
  }, [loaded, isLoggedIn, router]);

  const getRedirect = () => {
    const r = sessionStorage.getItem("authRedirect");
    sessionStorage.removeItem("authRedirect");
    return r || "/home";
  };

  // Real email signup
  const handleEmailSignup = async () => {
    if (!email || !password) {
      toast.show("メールアドレスとパスワードを入力してください", "error");
      return;
    }
    if (password.length < 6) {
      toast.show("パスワードは6文字以上で入力してください", "error");
      return;
    }

    setLoading(true);
    const { error } = await signup(email, password, {
      full_name: name || "ユーザー",
    });
    setLoading(false);

    if (error) {
      toast.show(
        error.message === "User already registered"
          ? "このメールアドレスは既に登録されています"
          : error.message,
        "error",
      );
      return;
    }

    // Create pet if petName provided (pet creation happens after profile is created by trigger)
    // The useAuth hook will fetch the profile via onAuthStateChange → fetchProfile
    // Pet creation will be handled after redirect via a separate flow

    router.push(getRedirect());
  };

  // Real email login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.show("メールアドレスとパスワードを入力してください", "error");
      return;
    }

    setLoading(true);
    const { error } = await loginWithEmail(email, password);
    setLoading(false);

    if (error) {
      toast.show("メールアドレスまたはパスワードが正しくありません", "error");
      return;
    }

    router.push(getRedirect());
  };

  // OAuth login (Google/Apple)
  // NOTE: Google/Apple OAuth not yet configured in Supabase.
  // signInWithOAuth() triggers a page redirect, so error callback never fires.
  // Using mock login until OAuth credentials are provided by the client.
  const handleOAuth = () => {
    login({ name: name || "ユーザー", petName: petName || "モカ" });
    router.push(getRedirect());
    // When OAuth is configured, replace above with:
    // loginWithOAuth(provider);
  };

  // Submit handler (signup or login based on mode)
  const handleSubmit = () => {
    if (isLogin) {
      handleEmailLogin();
    } else {
      handleEmailSignup();
    }
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
            {isLogin ? "おかえりなさい！" : "ベストショットを保存して、"}
            {!isLogin && (
              <>
                <br />
                動物を救おう
              </>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-[#4B5563]"
          >
            {isLogin ? "ログインしてください" : "YOLOに参加しよう"}
          </motion.p>
        </div>

        {/* Social login buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => handleOAuth()}
            disabled={loading}
            className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50"
          >
            <span className="text-lg font-bold">G</span> Googleで続ける
          </button>
          <button
            onClick={() => handleOAuth()}
            disabled={loading}
            className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-black py-3 font-medium text-white transition-all duration-200 hover:bg-gray-900 hover:shadow-sm disabled:opacity-50"
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
              メールアドレスで{isLogin ? "ログイン" : "登録"}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              {!isLogin && (
                <>
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
                </>
              )}
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
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="focus:ring-accent/50 focus:border-accent w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="shadow-accent/20 h-12 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "処理中..." : isLogin ? "ログイン" : "登録"}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Toggle login/signup */}
        <div className="mb-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setShowEmailForm(false);
            }}
            className="text-accent text-sm font-medium hover:underline"
          >
            {isLogin
              ? "アカウントをお持ちでない方 → 新規登録"
              : "すでにアカウントをお持ちの方 → ログイン"}
          </button>
        </div>

        {/* Donation message */}
        {!isLogin && (
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
        )}

        {/* Terms text */}
        <p className="mb-4 text-center text-[10px] leading-relaxed text-gray-400">
          {isLogin ? "ログイン" : "登録"}することで、
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
