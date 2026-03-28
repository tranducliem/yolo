import type { MockPlan } from "@/types";

export const PLANS: MockPlan[] = [
  {
    id: "free", name: "Free", monthlyPrice: 0, yearlyPrice: 0,
    features: ["ベストショットAI（月3回）", "探索・閲覧", "クラウン・DARe参加", "バトル（週1回）"],
    donationAmount: 0, donationStars: "", maxAmbassadorLevel: 1,
  },
  {
    id: "plus", name: "YOLO+", monthlyPrice: 480, yearlyPrice: 4800,
    features: ["ベストショットAI 無制限", "スタジオ（月5回）", "広告なし", "感情カウンター", "PAWポイント2倍"],
    recommended: true, donationAmount: 48, donationStars: "⭐", maxAmbassadorLevel: 2,
  },
  {
    id: "pro", name: "YOLO PRO", monthlyPrice: 1480, yearlyPrice: 14800,
    features: ["YOLO+の全機能", "スタジオ無制限", "毎月フォトブック無料", "毎月レター", "バトル無制限", "優先サポート"],
    donationAmount: 148, donationStars: "⭐⭐", maxAmbassadorLevel: 4,
  },
  {
    id: "family", name: "YOLO FAMILY", monthlyPrice: 2980, yearlyPrice: 29800,
    features: ["PROの全機能", "家族5人まで", "共有アルバム", "祖父母自動配信", "キッズモード", "年4回ソング"],
    donationAmount: 298, donationStars: "⭐⭐⭐", maxAmbassadorLevel: 5,
  },
];
