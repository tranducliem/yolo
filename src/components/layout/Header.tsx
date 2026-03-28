"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FullScreenMenu from "@/components/layout/FullScreenMenu";

export default function Header() {
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* Sticky header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          show ? "bg-white/90 backdrop-blur-md shadow-sm translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/" className="text-lg font-bold text-accent">🐾 YOLO</Link>
          <div className="flex items-center gap-3">
            <Link href="/signup" className="text-sm text-accent font-medium hover:underline transition-colors">
              ログイン
            </Link>
            <Link href="/try"
              className="px-4 py-1.5 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-sm font-bold rounded-lg hover:shadow-md transition-all duration-200">
              無料で試す
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-accent transition-colors"
              aria-label="メニュー"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </header>

      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
