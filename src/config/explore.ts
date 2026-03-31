export const EXPLORE_CATEGORIES = [
  { id: "recommend", label: "おすすめ" },
  { id: "dog", label: "犬" },
  { id: "cat", label: "猫" },
  { id: "funny", label: "おもしろ" },
  { id: "sleeping", label: "寝顔" },
  { id: "walk", label: "おさんぽ" },
  { id: "snack", label: "おやつ" },
  { id: "crown", label: "👑Crown" },
  { id: "battle", label: "⚔️Battle" },
  { id: "dare", label: "🎯お題" },
  { id: "donation", label: "🌟寄付" },
] as const;

export type ExploreCategoryId = (typeof EXPLORE_CATEGORIES)[number]["id"];
