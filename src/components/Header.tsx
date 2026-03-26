"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        show ? "bg-white/90 backdrop-blur-md shadow-sm translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
        <Link href="/" className="text-lg font-bold text-accent">🐾 tomoni</Link>
        <Link href="/try"
          className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-dark transition-colors">
          無料で試す
        </Link>
      </div>
    </header>
  );
}
