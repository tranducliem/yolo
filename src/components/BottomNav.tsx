"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";

const HIDDEN_ALWAYS = ["/", "/try", "/analyzing", "/results", "/signup"];
const GUEST_VISIBLE = ["/explore", "/ranking", "/pet"];

const tabs = [
  { href: "/home", icon: "🏠", label: "ホーム" },
  { href: "/explore", icon: "🔍", label: "探索" },
  { href: "/try", icon: "✨", label: "AI", center: true },
  { href: "/ranking", icon: "🔥", label: "ランキング" },
  { href: "/mypage", icon: "🐾", label: "マイページ" },
];

export default function BottomNav() {
  const path = usePathname();
  const { isLoggedIn } = useAuth();
  const [authModal, setAuthModal] = useState(false);

  if (HIDDEN_ALWAYS.includes(path) || path.startsWith("/admin")) return null;
  const isGuestPage = GUEST_VISIBLE.some((p) => path.startsWith(p));
  if (!isLoggedIn && !isGuestPage) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((t) => {
            const active = path === t.href;
            const needsAuth = !isLoggedIn && (t.href === "/home" || t.href === "/mypage");

            if (t.center) {
              return (
                <Link key={t.href} href={t.href}
                  className="flex flex-col items-center -mt-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] flex items-center justify-center text-2xl shadow-lg shadow-accent/30">
                    <span className="text-white text-2xl">✨</span>
                  </div>
                  <span className="text-[10px] font-medium text-accent mt-0.5">AI</span>
                </Link>
              );
            }

            if (needsAuth) {
              return (
                <button key={t.href} onClick={() => setAuthModal(true)}
                  className="flex flex-col items-center gap-0.5 text-gray-300">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              );
            }

            return (
              <Link key={t.href} href={t.href}
                className={`flex flex-col items-center gap-0.5 ${active ? "text-accent" : "text-gray-400"}`}>
                <span className="text-xl">{t.icon}</span>
                <span className="text-[10px] font-medium">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="default" />
    </>
  );
}
