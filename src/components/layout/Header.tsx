"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import FullScreenMenu from "@/components/layout/FullScreenMenu";

function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications?limit=1")
      .then((r) => (r.ok ? r.json() : { unreadCount: 0 }))
      .then((d) => setUnread(d.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  return (
    <button onClick={() => router.push("/notifications")} className="relative">
      <span className="text-xl">🔔</span>
      {unread > 0 && (
        <span className="bg-red absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

interface HeaderProps {
  /** "marketing" = scroll-reveal fixed header (homepage hero), "app" = always-visible sticky header */
  variant?: "marketing" | "app";
}

export default function Header({ variant = "app" }: HeaderProps) {
  const { isLoggedIn } = useAuth();
  const [show, setShow] = useState(variant === "app");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "marketing") return;
    const onScroll = () => setShow(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          show ? "translate-y-0 bg-white/90 shadow-sm backdrop-blur-md" : "-translate-y-full"
        } ${variant === "app" && isLoggedIn ? "lg:left-60" : ""}`}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          {/* Left: Logo */}
          <Link href={isLoggedIn ? "/home" : "/"} className="text-accent text-lg font-bold">
            🐾 YOLO
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NotificationBell />
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="text-accent text-sm font-medium transition-colors hover:underline"
                >
                  ログイン
                </Link>
                <Link
                  href="/try"
                  className="rounded-lg bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-4 py-1.5 text-sm font-bold text-white transition-all duration-200 hover:shadow-md"
                >
                  無料で試す
                </Link>
              </>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="hover:text-accent flex h-9 w-9 items-center justify-center text-gray-600 transition-colors"
              aria-label="メニュー"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header (app variant only) */}
      {variant === "app" && <div className="h-14" />}

      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
