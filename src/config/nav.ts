export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export const USER_NAV: NavItem[] = [
  { label: "ホーム", href: "/home", icon: "🏠", requireAuth: true },
  { label: "探索", href: "/explore", icon: "🔍" },
  { label: "AI分析", href: "/try", icon: "📸" },
  { label: "ランキング", href: "/ranking", icon: "🏆" },
  { label: "バトル", href: "/battle", icon: "⚔️", requireAuth: true },
  { label: "寄付", href: "/donation", icon: "💝" },
  { label: "ショップ", href: "/goods", icon: "🛍️" },
  { label: "フォトブック", href: "/book", icon: "📖", requireAuth: true },
  { label: "スタジオ", href: "/studio", icon: "🎨", requireAuth: true },
  { label: "マイページ", href: "/mypage", icon: "👤", requireAuth: true },
  { label: "お知らせ", href: "/notifications", icon: "🔔", requireAuth: true },
  { label: "注文履歴", href: "/orders", icon: "📦", requireAuth: true },
  { label: "設定", href: "/settings", icon: "⚙️", requireAuth: true },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "ダッシュボード", href: "/admin", icon: "📊", adminOnly: true },
  { label: "ユーザー", href: "/admin/users", icon: "👥", adminOnly: true },
  { label: "分析", href: "/admin/analytics", icon: "📈", adminOnly: true },
  { label: "注文", href: "/admin/orders", icon: "📦", adminOnly: true },
  { label: "寄付", href: "/admin/donation", icon: "💝", adminOnly: true },
  { label: "サブスク", href: "/admin/subscription", icon: "💳", adminOnly: true },
  { label: "クラウン", href: "/admin/crown", icon: "👑", adminOnly: true },
  { label: "DARe", href: "/admin/dare", icon: "🎯", adminOnly: true },
  { label: "コンテンツ", href: "/admin/content", icon: "📝", adminOnly: true },
  { label: "スポンサー", href: "/admin/sponsors", icon: "🤝", adminOnly: true },
];
