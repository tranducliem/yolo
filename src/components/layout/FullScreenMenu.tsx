"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const menuLinks = [
  { href: "/try", label: "✨ ベストショットを試す", accent: true },
  { href: "/home", label: "🏠 ホーム" },
  { href: "/mypage", label: "🐾 マイページ" },
  { href: "/donation", label: "🌟 寄付" },
  { href: "/ambassador", label: "👑 アンバサダー" },
  { href: "/goods", label: "🎁 グッズ" },
  { href: "/book", label: "📖 フォトブック" },
  { href: "/explore", label: "🔍 Explore" },
  { href: "/ranking", label: "🔥 ランキング" },
  { href: "/battle", label: "⚔️ Battle" },
  { href: "/studio", label: "🎨 Studio" },
  { href: "/subscription", label: "💎 プラン" },
  { href: "/settings", label: "⚙️ 設定" },
  { href: "/orders", label: "📦 注文履歴" },
];

export default function FullScreenMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { isLoggedIn, logout } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col"
        >
          {/* Close button */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
            <span className="text-lg font-bold text-accent">🐾 YOLO</span>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="閉じる"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Menu links */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <nav className="space-y-1">
              {menuLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {link.accent ? (
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="block w-full py-3 px-4 mb-3 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold text-center rounded-xl shadow-md"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="block py-3 px-4 text-gray-700 hover:text-accent hover:bg-accent/5 rounded-xl transition-colors text-[15px]"
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>

            <div className="border-t border-gray-100 my-4" />

            {isLoggedIn ? (
              <button
                onClick={() => { logout(); onClose(); }}
                className="block w-full text-left py-3 px-4 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors text-[15px]"
              >
                🚪 ログアウト
              </button>
            ) : (
              <Link
                href="/signup"
                onClick={onClose}
                className="block py-3 px-4 text-accent font-medium hover:bg-accent/5 rounded-xl transition-colors text-[15px]"
              >
                🔐 ログイン
              </Link>
            )}

            <div className="border-t border-gray-100 my-4" />

            <Link
              href="/admin"
              onClick={onClose}
              className="block py-3 px-4 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-[15px]"
            >
              👨‍💼 管理画面
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
