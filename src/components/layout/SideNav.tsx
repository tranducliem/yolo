"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";

const links = [
  { href: "/home", icon: "🏠", label: "ホーム" },
  { href: "/explore", icon: "🔍", label: "探索" },
  { href: "/try", icon: "✨", label: "AI分析" },
  { href: "/post", icon: "📷", label: "投稿" },
  { href: "/ranking", icon: "🔥", label: "ランキング" },
  { href: "/battle", icon: "⚔️", label: "Battle" },
  { href: "/studio", icon: "🎨", label: "Studio" },
  { href: "/book", icon: "📖", label: "Book" },
  { href: "/goods", icon: "🎁", label: "Goods" },
  { href: "/donation", icon: "🌟", label: "寄付" },
  { href: "/ambassador", icon: "👑", label: "大使" },
  { href: "/mypage", icon: "🐾", label: "マイページ" },
];

export default function SideNav() {
  const path = usePathname();
  const { isLoggedIn, user, logout } = useAuth();
  if (!isLoggedIn) return null;

  const me = mockPets[0];
  return (
    <aside className="fixed top-0 bottom-0 left-0 z-50 hidden w-60 flex-col border-r border-gray-100 bg-white shadow-sm lg:flex">
      <div className="p-6">
        <Link href="/home" className="text-accent text-2xl font-bold">
          🐾 YOLO
        </Link>
        <p className="mt-0.5 text-[10px] text-gray-400">ずっと、ともに。</p>
      </div>
      <nav className="flex-1 px-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              path === l.href
                ? "bg-accent/10 text-accent border-accent border-l-4"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Donation section */}
      <Link
        href="/donation"
        className="mx-3 mb-2 flex items-center justify-between rounded-xl bg-emerald-50 p-3 transition-colors hover:bg-emerald-100"
      >
        <div>
          <p className="text-[10px] font-medium text-emerald-600">🌟 寄付累計</p>
          <p className="text-sm font-bold text-emerald-700">
            ¥{(user?.donationTotal ?? 0).toLocaleString()}
          </p>
        </div>
        <span className="text-xs text-gray-400">→</span>
      </Link>

      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.pets?.[0]?.avatarUrl || user?.avatarUrl || me.imageUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold">{user?.petName || me.name}</p>
              <AmbassadorBadge level={user?.ambassadorLevel ?? 0} compact />
            </div>
            <p className="text-[10px] text-gray-400">{user?.pets?.[0]?.breed || me.breed}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full rounded-lg py-2 text-xs text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}
