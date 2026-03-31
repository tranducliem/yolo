import type { AmbassadorRank } from "@/types";

export const AMBASSADOR_RANKS: AmbassadorRank[] = [
  {
    level: 1,
    name: "サポーター",
    emoji: "🌱",
    requiredPlan: "Free会員OK",
    conditions: ["初回投稿"],
    benefits: ["寄付ダッシュボード閲覧"],
    donationMultiplier: 1,
  },
  {
    level: 2,
    name: "ガーディアン",
    emoji: "🌟",
    requiredPlan: "YOLO+以上必須",
    conditions: ["寄付タグ付き投稿10回", "YOLO+以上"],
    benefits: ["銀バッジ", "限定フレーム", "寄付レポート詳細"],
    donationMultiplier: 1.5,
  },
  {
    level: 3,
    name: "地域アンバサダー",
    emoji: "👑",
    requiredPlan: "PRO以上必須",
    conditions: ["フォロワー100人", "寄付貢献地域TOP", "PRO以上"],
    benefits: ["金バッジ", "地域枠（限定1名）", "Explore上位表示", "アンバサダー限定フレーム"],
    donationMultiplier: 2,
  },
  {
    level: 4,
    name: "マスター",
    emoji: "💎",
    requiredPlan: "PRO以上必須",
    conditions: ["紹介50人 or 寄付貢献TOP50", "PRO以上"],
    benefits: ["ダイヤバッジ", "YOLO運営直通チャット", "新機能先行アクセス", "限定イベント招待"],
    donationMultiplier: 3,
  },
  {
    level: 5,
    name: "レジェンド",
    emoji: "🏆",
    requiredPlan: "FAMILY必須",
    conditions: ["年間寄付貢献TOP10 or 紹介100人", "FAMILY"],
    benefits: ["虹色バッジ", "公式パートナー", "グッズ無料", "保護施設訪問ツアー"],
    donationMultiplier: 5,
  },
];
