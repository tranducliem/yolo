"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", icon: "📊", label: "KPI", exact: true },
  { href: "/admin/crown", icon: "👑", label: "Crown" },
  { href: "/admin/dare", icon: "🎯", label: "Dare" },
  { href: "/admin/orders", icon: "📦", label: "注文" },
  { href: "/admin/users", icon: "👥", label: "ユーザー" },
  { href: "/admin/content", icon: "📝", label: "コンテンツ" },
  { href: "/admin/subscription", icon: "💎", label: "サブスク" },
  { href: "/admin/analytics", icon: "📈", label: "バイラル" },
  { href: "/admin/donation", icon: "🌟", label: "寄付" },
  { href: "/admin/sponsors", icon: "🏷️", label: "スポンサー" },
];

export default function AdminSideNav() {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      <div className="p-6">
        <Link href="/admin" className="text-xl font-bold text-white">🐾 YOLO Admin</Link>
      </div>
      <nav className="flex-1 px-3 overflow-y-auto">
        {links.map((l) => {
          const active = l.exact ? path === l.href : path.startsWith(l.href) && path !== "/admin";
          const isExactAdmin = l.exact && path === l.href;
          const isActive = l.exact ? isExactAdmin : active;
          return (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-colors ${
                isActive ? "bg-accent text-white" : "text-gray-300 hover:bg-white/10"
              }`}>
              <span className="text-lg">{l.icon}</span>{l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">A</div>
        <div>
          <p className="text-sm text-white font-medium">管理者</p>
          <Link href="/" className="text-xs text-gray-400 hover:text-white">ログアウト</Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-navy flex-col z-50">
        {nav}
      </aside>

      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center text-lg shadow-lg">
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-navy flex flex-col">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
