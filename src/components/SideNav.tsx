"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AmbassadorBadge from "@/components/AmbassadorBadge";

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
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return null;

  const me = mockPets[0];
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 shadow-sm flex-col z-50">
      <div className="p-6">
        <Link href="/home" className="text-2xl font-bold text-accent">🐾 YOLO</Link>
        <p className="text-[10px] text-gray-400 mt-0.5">ずっと、ともに。</p>
      </div>
      <nav className="flex-1 px-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-colors ${
              path === l.href ? "bg-accent/10 text-accent border-l-4 border-accent" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <span className="text-lg">{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>

      {/* Donation section */}
      <Link href="/donation" className="mx-3 mb-2 p-3 bg-emerald-50 rounded-xl flex items-center justify-between hover:bg-emerald-100 transition-colors">
        <div>
          <p className="text-[10px] text-emerald-600 font-medium">🌟 寄付累計</p>
          <p className="text-sm font-bold text-emerald-700">¥2,340</p>
        </div>
        <span className="text-gray-400 text-xs">→</span>
      </Link>

      <div className="p-4 border-t border-gray-100 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={me.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold">{user?.petName || me.name}</p>
            <AmbassadorBadge level={3} compact />
          </div>
          <p className="text-[10px] text-gray-400">{me.breed}</p>
        </div>
      </div>
    </aside>
  );
}
