// ============================================================
// YOLO — Mock Data (Donation & Ambassador Edition)
// ============================================================

// ── Interfaces ──

export interface MockPet {
  id: string; name: string; species: "dog" | "cat"; breed: string;
  ownerName: string; imageUrl: string; photos: string[];
  score: number; smileScore: number; loveScore: number; rareScore: number;
  followers: number; following: number; postCount: number; likeCount: number;
  pawPoints: number; crownCount: number; battleCount: number; dareCount: number;
  rankChange: number;
  donationCount: number;
  ambassadorLevel?: number;
  ambassadorRegion?: string;
  age: string;
}

export interface MockPost {
  id: string; petId: string; petName: string; ownerName: string;
  imageUrl: string; caption: string; tags: string[];
  emotions: { happy: number; funny: number; touched: number; crying: number };
  likes: number; comments: number; shares: number;
  createdAt: string; isBoosted?: boolean;
  isDonationTag?: boolean; donationAmount?: number;
  ambassadorLevel?: number;
}

export interface MockGoods {
  id: string; name: string; price: number; category: "2d" | "3d" | "book";
  emoji: string; description: string; size?: string;
}

export interface MockBookTemplate {
  id: string; name: string; emoji: string; price: number; description: string;
}

export interface MockNotification {
  id: string; type: "like" | "follow" | "crown" | "battle" | "dare" | "letter" | "song" | "order" | "system" | "donation";
  icon: string; text: string; time: string; read: boolean; link: string;
}

export interface MockPlan {
  id: string; name: string; monthlyPrice: number; yearlyPrice: number;
  features: string[]; recommended?: boolean;
  donationAmount: number;
  donationStars: string;
  maxAmbassadorLevel: number;
}

export interface MockOrder {
  id: string; orderNumber: string; date: string;
  status: "new" | "processing" | "shipping" | "completed" | "cancelled";
  items: { name: string; quantity: number; price: number; imageUrl: string }[];
  total: number; shippingAddress: string; trackingNumber?: string;
  donationAmount: number;
}

export interface CartItem {
  id: string; goodsId: string; name: string; price: number;
  quantity: number; imageUrl: string; variant?: string;
}

export interface MockBattle {
  id: string;
  pet1: { id: string; name: string; breed: string; imageUrl: string; votes: number; ambassadorLevel?: number };
  pet2: { id: string; name: string; breed: string; imageUrl: string; votes: number; ambassadorLevel?: number };
  round: string;
}

export interface MockCrownHistory {
  date: string; petId: string; petName: string; ownerName: string;
  imageUrl: string; views: number; likes: number; shares: number; mode: "auto" | "manual";
}

export interface MockDare {
  id: string; theme: string; hashtag: string; description: string;
  startDate: string; endDate: string; participants: number; posts: number;
  status: "scheduled" | "active" | "ended" | "draft";
  rewards: { first: number; second: number; third: number; participation: number };
  isDonationChallenge?: boolean;
}

export interface MockAdminUser {
  id: string; name: string; email: string; plan: "free" | "plus" | "pro" | "family";
  petCount: number; arpu: number; registeredAt: string; lastLogin: string;
  postCount: number; likeCount: number; crownCount: number;
  pets: { name: string; species: string; breed: string }[];
  donationTotal: number; ambassadorLevel: number;
}

export interface MockReport {
  id: string; postId: string; postImage: string; reporterName: string;
  reason: string; date: string; status: "pending" | "resolved" | "dismissed";
  targetUser: string;
}

export interface MockKPI {
  date: string; dau: number; mau: number; mrr: number;
  paidRate: number; downloads: number;
  donationTotal: number; donorCount: number;
}

export interface MockViralLoop { name: string; kFactor: number; }

// ── Donation Interfaces ──

export interface DonationTag {
  id: string; tag: string; label: string; posts: number;
  donationTotal: number; isActive: boolean; isSponsor?: boolean;
  sponsorName?: string;
}

export interface DonationNPO {
  id: string; name: string; location: string; target: "dog" | "cat" | "both";
  allocationPercent: number; totalDonated: number; bankInfo: string;
}

export interface DonationMonthly {
  month: string; fromSubscription: number; fromGoods: number;
  fromAdditional: number; fromSponsor: number; total: number;
}

export interface DonationReport {
  id: string; month: string; npoName: string; npoLocation: string;
  text: string; images: string[]; dogCount: number; catCount: number;
  totalAmount: number;
}

export interface DonationRanking {
  rank: number; name: string; petName: string; imageUrl: string;
  amount: number; ambassadorLevel: number;
}

export interface PersonalDonation {
  month: string; fromSubscription: number; fromGoods: number;
  fromAdditional: number; total: number;
}

// ── Ambassador Interfaces ──

export interface AmbassadorRank {
  level: number; name: string; emoji: string;
  requiredPlan: string; conditions: string[];
  benefits: string[]; donationMultiplier: number;
}

export interface PrefectureAmbassador {
  prefecture: string; region: string;
  dog?: { name: string; petName: string; imageUrl: string; donationTotal: number; postCount: number };
  cat?: { name: string; petName: string; imageUrl: string; donationTotal: number; postCount: number };
}

export interface LegendEntry {
  name: string; petName: string; imageUrl: string;
  totalDonation: number; badge: string;
}

// ── Sponsor Interfaces ──

export interface MockSponsor {
  id: string; companyName: string; budget: number; tag: string;
  targetAge?: string; targetGender?: string; targetPetType?: string;
  targetRegion?: string; budgetAllocated: number;
  startDate: string; endDate: string;
  status: "active" | "scheduled" | "ended" | "draft";
  npoId: string; postCount: number; impressions: number;
  donationTotal: number;
}

// ── Photo URLs ──
const petImages: string[] = Array.from({ length: 20 }, (_, i) => `https://placedog.net/500/500?id=${i + 1}`);

// ── Pet definitions (20 pets — realistic Japanese names) ──
const petDefs: {
  name: string; species: "dog" | "cat"; breed: string; owner: string; age: string;
  ambLv: number; ambRegion?: string;
}[] = [
  { name: "モカ", species: "dog", breed: "トイプードル", owner: "藤吉 ヒロシ", age: "3歳", ambLv: 3, ambRegion: "福岡・犬" },
  { name: "ルナ", species: "cat", breed: "スコティッシュフォールド", owner: "田中 ユイ", age: "2歳", ambLv: 2 },
  { name: "チョコ", species: "dog", breed: "柴犬", owner: "山田 タケシ", age: "5歳", ambLv: 1 },
  { name: "ハナ", species: "cat", breed: "マンチカン", owner: "佐藤 サキ", age: "1歳", ambLv: 0 },
  { name: "リク", species: "dog", breed: "ゴールデンレトリバー", owner: "鈴木 ケンジ", age: "4歳", ambLv: 0 },
  { name: "ミミ", species: "cat", breed: "ラグドール", owner: "高橋 アヤ", age: "3歳", ambLv: 2 },
  { name: "ソラ", species: "dog", breed: "ポメラニアン", owner: "伊藤 マサト", age: "2歳", ambLv: 0 },
  { name: "キナコ", species: "cat", breed: "アメリカンショートヘア", owner: "渡辺 ミカ", age: "4歳", ambLv: 1 },
  { name: "マロン", species: "dog", breed: "ミニチュアダックスフンド", owner: "中村 ユウタ", age: "6歳", ambLv: 0 },
  { name: "ミント", species: "cat", breed: "ブリティッシュショートヘア", owner: "小林 ナナ", age: "1歳", ambLv: 0 },
  { name: "コタロウ", species: "dog", breed: "フレンチブルドッグ", owner: "加藤 ショウ", age: "3歳", ambLv: 3, ambRegion: "東京・犬" },
  { name: "ベル", species: "cat", breed: "ペルシャ", owner: "吉田 レイ", age: "5歳", ambLv: 0 },
  { name: "レオ", species: "dog", breed: "チワワ", owner: "山口 ダイキ", age: "2歳", ambLv: 0 },
  { name: "メル", species: "cat", breed: "メインクーン", owner: "松本 サヤ", age: "3歳", ambLv: 4 },
  { name: "フク", species: "dog", breed: "シーズー", owner: "井上 ヒロミ", age: "7歳", ambLv: 0 },
  { name: "ノア", species: "cat", breed: "ロシアンブルー", owner: "木村 アキラ", age: "2歳", ambLv: 0 },
  { name: "ポチ", species: "dog", breed: "ビーグル", owner: "林 コウジ", age: "4歳", ambLv: 0 },
  { name: "タマ", species: "cat", breed: "日本猫（三毛）", owner: "清水 ミホ", age: "8歳", ambLv: 5 },
  { name: "ゴン", species: "dog", breed: "コーギー", owner: "斉藤 リョウ", age: "3歳", ambLv: 0 },
  { name: "サクラ", species: "cat", breed: "ベンガル", owner: "前田 ユカリ", age: "1歳", ambLv: 0 },
];

export const mockPets: MockPet[] = petDefs.map((p, i) => {
  const main = petImages[i];
  const photos = Array.from({ length: 9 }, (_, j) => petImages[(i + j) % 20]);
  return {
    id: `pet-${i + 1}`, name: p.name, species: p.species, breed: p.breed,
    ownerName: p.owner, imageUrl: main, photos, age: p.age,
    score: 97 - i,
    smileScore: Math.min(5, 5 - Math.floor(i / 5)),
    loveScore: Math.min(5, 5 - Math.floor(i / 7)),
    rareScore: Math.min(5, 3 + (i % 3)),
    followers: Math.max(10, Math.floor(5000 / (i + 1)) + (i * 37) % 100),
    following: 20 + (i * 13) % 180,
    postCount: 5 + (i * 7) % 45,
    likeCount: 100 + (i * 97) % 1900,
    pawPoints: 50 + (i * 43) % 450,
    crownCount: i < 3 ? 1 + (i % 4) : 0,
    battleCount: i < 8 ? (i * 3) % 10 : 0,
    dareCount: (i * 5) % 15,
    rankChange: ((i * 7) % 11) - 5,
    donationCount: Math.max(0, 50 - i * 3 + (i * 7) % 20),
    ambassadorLevel: p.ambLv || undefined,
    ambassadorRegion: p.ambRegion,
  };
});

// ── Posts (30) — 10 with donation tags ──
const captions = [
  "今日のおやつタイム🍖 モグモグが止まらない！",
  "お散歩日和☀️ 公園で走り回ったよ",
  "こっち見てくれた！📷 奇跡の1枚",
  "お昼寝中zzz 寝顔が可愛すぎる",
  "初めてのお洋服👗 似合ってるかな？",
  "ボール遊びに夢中🎾 キャッチ成功！",
  "窓辺でまったり🪟 外の鳥を観察中",
  "お風呂上がりのふわふわ✨ いい匂い",
  "今日は誕生日🎂 ケーキでお祝い",
  "新しいおもちゃに夢中🧸 離さないっ！",
];
const tagPool = [
  "#YOLODare", "#ベストショット", "#お散歩", "#おやつタイム",
  "#寝顔", "#お出かけ", "#おもしろ", "#モフモフ", "#親バカ", "#ペットのいる暮らし",
];
const donationTagPool = ["#YOLO保護犬を救おう", "#YOLO猫の命", "#YOLOチャリティ"];

export const mockPosts: MockPost[] = Array.from({ length: 30 }, (_, i) => {
  const pet = mockPets[i % 20];
  const isDonation = i % 3 === 0;
  return {
    id: `post-${i + 1}`, petId: pet.id, petName: pet.name, ownerName: pet.ownerName,
    imageUrl: pet.photos[i % pet.photos.length],
    caption: captions[i % captions.length],
    tags: isDonation
      ? [donationTagPool[i % donationTagPool.length], tagPool[i % tagPool.length]]
      : [tagPool[i % tagPool.length], tagPool[(i + 3) % tagPool.length]],
    emotions: {
      happy: 50 + (i * 31) % 290,
      funny: 20 + (i * 17) % 145,
      touched: 10 + (i * 11) % 80,
      crying: (i * 7) % 30,
    },
    likes: 80 + (i * 53) % 950,
    comments: 8 + (i * 11) % 95,
    shares: 3 + (i * 7) % 50,
    createdAt: i < 5 ? `${i + 1}分前` : i < 15 ? `${Math.floor(i / 2)}時間前` : `${Math.floor(i / 7)}日前`,
    isBoosted: i % 7 === 0,
    isDonationTag: isDonation,
    donationAmount: isDonation ? 10 + (i % 5) * 10 : undefined,
    ambassadorLevel: pet.ambassadorLevel,
  };
});

// ── Goods (9) ──
export const mockGoods: MockGoods[] = [
  { id: "g1", name: "アクリルスタンド", price: 480, category: "2d", emoji: "🏷️", description: "透明アクリルにベストショットを印刷" },
  { id: "g2", name: "マグカップ", price: 1480, category: "2d", emoji: "☕", description: "毎日の癒しタイムに" },
  { id: "g3", name: "Tシャツ", price: 2980, category: "2d", emoji: "👕", description: "お気に入りの1枚をウェアに" },
  { id: "g4", name: "スマホケース", price: 1980, category: "2d", emoji: "📱", description: "いつも一緒に持ち歩ける" },
  { id: "g5", name: "クッション", price: 2480, category: "2d", emoji: "🛋️", description: "ふわふわ抱き心地" },
  { id: "g6", name: "フォトパネル", price: 5980, category: "2d", emoji: "🖼️", description: "インテリアにぴったり" },
  { id: "g7", name: "ミニフィギュア", price: 2980, category: "3d", emoji: "🎎", description: "手のひらサイズの可愛さ", size: "3cm" },
  { id: "g8", name: "スタンダードフィギュア", price: 9800, category: "3d", emoji: "🏆", description: "飾りやすいサイズ感", size: "7cm" },
  { id: "g9", name: "プレミアムフィギュア", price: 19800, category: "3d", emoji: "👑", description: "最高精度の再現", size: "12cm" },
];

// ── Book Templates (3) ──
export const mockBookTemplates: MockBookTemplate[] = [
  { id: "b1", name: "シンプル", emoji: "📕", price: 980, description: "シンプルで洗練されたデザイン" },
  { id: "b2", name: "コラージュ", emoji: "📗", price: 2980, description: "複数枚をおしゃれに配置" },
  { id: "b3", name: "プレミアム", emoji: "📘", price: 4980, description: "高品質紙・箔押し表紙" },
];

// ── Studio Styles ──
export const studioStyles = [
  { id: "oil", name: "油絵", emoji: "🎨", filter: "saturate(1.5) contrast(1.3)" },
  { id: "watercolor", name: "水彩", emoji: "💧", filter: "brightness(1.1) saturate(0.8) blur(0.5px)" },
  { id: "anime", name: "アニメ", emoji: "🌸", filter: "saturate(1.8) contrast(1.2) brightness(1.1)" },
  { id: "ukiyoe", name: "浮世絵", emoji: "🏯", filter: "sepia(0.6) saturate(1.5) contrast(1.4)" },
  { id: "popart", name: "ポップアート", emoji: "🎭", filter: "saturate(2.5) contrast(1.5) hue-rotate(30deg)" },
  { id: "stained", name: "ステンドグラス", emoji: "🌈", filter: "saturate(2) contrast(1.8) brightness(0.9)" },
];

// ── Explore Categories ──
export const exploreCategories = [
  { id: "recommend", label: "🔥おすすめ" }, { id: "dog", label: "🐶犬" },
  { id: "cat", label: "🐱猫" }, { id: "funny", label: "😂おもしろ" },
  { id: "sleeping", label: "😴寝顔" }, { id: "walk", label: "🏃お散歩" },
  { id: "snack", label: "🍖おやつ" }, { id: "crown", label: "👑Crown" },
  { id: "battle", label: "⚔️Battle" }, { id: "dare", label: "🎯Dare" },
  { id: "donation", label: "🌟寄付チャレンジ" },
];

// ── Tags ──
export const availableTags = [
  "#YOLODare", "#ベストショット", "#お散歩", "#おやつタイム",
  "#寝顔", "#お出かけ", "#おもしろ", "#モフモフ",
];
export const donationTags = [
  "#YOLO保護犬を救おう", "#YOLO猫の命", "#YOLOチャリティ",
];

// ── Notifications (20) ──
export const mockNotifications: MockNotification[] = [
  { id: "n1", type: "like", icon: "❤️", text: "田中 ユイさんがモカの写真に❤️", time: "1分前", read: false, link: "/explore" },
  { id: "n2", type: "donation", icon: "🌟", text: "あなたの写真 #YOLO保護犬を救おう が3匹の食事になりました", time: "5分前", read: false, link: "/donation" },
  { id: "n3", type: "follow", icon: "👥", text: "山口 ダイキさんにフォローされました", time: "15分前", read: false, link: "/pet/pet-13" },
  { id: "n4", type: "crown", icon: "👑", text: "モカがCrownに選ばれました！おめでとう🎉", time: "30分前", read: false, link: "/home" },
  { id: "n5", type: "donation", icon: "🌟", text: "今月の寄付レポートが届きました — 犬12匹・猫8匹の食事を届けました", time: "1時間前", read: false, link: "/donation" },
  { id: "n6", type: "battle", icon: "⚔️", text: "モカがBattleで勝利！勝率72%に上昇📈", time: "2時間前", read: true, link: "/battle" },
  { id: "n7", type: "like", icon: "❤️", text: "高橋 アヤさんがモカの写真に😊", time: "3時間前", read: true, link: "/explore" },
  { id: "n8", type: "donation", icon: "👑", text: "福岡の犬アンバサダーに昇格しました！寄付倍率2xに🎊", time: "4時間前", read: true, link: "/ambassador" },
  { id: "n9", type: "dare", icon: "🎯", text: "今週のDare「#おやつタイム」に参加しよう🍖", time: "5時間前", read: true, link: "/home" },
  { id: "n10", type: "order", icon: "📦", text: "注文#YOLO-001が発送されました — 到着予定4/3", time: "6時間前", read: true, link: "/orders" },
  { id: "n11", type: "like", icon: "❤️", text: "鈴木 ケンジさん他12人がモカの写真に❤️", time: "8時間前", read: true, link: "/explore" },
  { id: "n12", type: "follow", icon: "👥", text: "松本 サヤさんにフォローされました", time: "10時間前", read: true, link: "/pet/pet-14" },
  { id: "n13", type: "system", icon: "🔔", text: "YOLO PROプランの7日間無料トライアルが利用可能です", time: "12時間前", read: true, link: "/subscription" },
  { id: "n14", type: "donation", icon: "🌟", text: "寄付タグ投稿が50件に到達！🐾+50ポイント獲得", time: "1日前", read: true, link: "/donation" },
  { id: "n15", type: "order", icon: "📦", text: "注文#YOLO-002の商品が到着しました — レビューを書きませんか？", time: "2日前", read: true, link: "/orders" },
  { id: "n16", type: "dare", icon: "🎯", text: "Dare「#寝顔選手権」の結果発表！あなたは5位🏅", time: "2日前", read: true, link: "/home" },
  { id: "n17", type: "like", icon: "❤️", text: "前田 ユカリさんがモカの写真を📤シェアしました", time: "3日前", read: true, link: "/explore" },
  { id: "n18", type: "donation", icon: "🌟", text: "グッズ購入で¥490が保護施設に届きました🌟", time: "4日前", read: true, link: "/donation" },
  { id: "n19", type: "system", icon: "🔔", text: "YOLOがアップデートされました — 新機能: 寄付ダッシュボード🎉", time: "5日前", read: true, link: "/donation" },
  { id: "n20", type: "system", icon: "🔔", text: "YOLOへようこそ！まずはベストショットを試しましょう📷", time: "7日前", read: true, link: "/try" },
];

// ── Subscription Plans (4) ──
export const mockPlans: MockPlan[] = [
  { id: "free", name: "Free", monthlyPrice: 0, yearlyPrice: 0, donationAmount: 0, donationStars: "", maxAmbassadorLevel: 1, features: [
    "ベストショットAI（月3回）", "Explore閲覧", "Crown/Dare参加", "Battle参加（週1回）", "広告あり",
  ]},
  { id: "plus", name: "YOLO+", monthlyPrice: 480, yearlyPrice: 4800, donationAmount: 48, donationStars: "🌟", maxAmbassadorLevel: 2, recommended: true, features: [
    "ベストショット無制限", "Studio（イラスト化）月5回", "広告なし", "Emotionカウンター", "Paw Points 2倍",
  ]},
  { id: "pro", name: "YOLO PRO", monthlyPrice: 1480, yearlyPrice: 14800, donationAmount: 148, donationStars: "🌟🌟🌟", maxAmbassadorLevel: 4, features: [
    "YOLO+の全機能", "Studio無制限", "フォトブック月1冊無料", "Letter月1通", "Battle無制限", "優先サポート",
  ]},
  { id: "family", name: "YOLO FAMILY", monthlyPrice: 2980, yearlyPrice: 29800, donationAmount: 298, donationStars: "🌟🌟🌟🌟🌟🌟", maxAmbassadorLevel: 5, features: [
    "PROの全機能", "ファミリー5人まで", "共有アルバム", "祖父母への自動配信", "子供モード", "Song年4曲",
  ]},
];

// ── Orders (5) ──
export const mockOrders: MockOrder[] = [
  { id: "o1", orderNumber: "YOLO-20260327-001", date: "2026-03-27", status: "shipping",
    items: [{ name: "フォトブック（プレミアム）", quantity: 1, price: 4980, imageUrl: petImages[0] }],
    total: 5480, shippingAddress: "福岡県福岡市中央区天神1-2-3", trackingNumber: "1234-5678-9012", donationAmount: 274 },
  { id: "o2", orderNumber: "YOLO-20260325-002", date: "2026-03-25", status: "completed",
    items: [{ name: "アクリルスタンド", quantity: 2, price: 480, imageUrl: petImages[0] }, { name: "マグカップ", quantity: 1, price: 1480, imageUrl: petImages[0] }],
    total: 2940, shippingAddress: "東京都渋谷区神宮前3-4-5", donationAmount: 147 },
  { id: "o3", orderNumber: "YOLO-20260322-003", date: "2026-03-22", status: "completed",
    items: [{ name: "フォトブック（シンプル）", quantity: 1, price: 980, imageUrl: petImages[1] }],
    total: 1480, shippingAddress: "大阪府大阪市北区梅田6-7-8", donationAmount: 74 },
  { id: "o4", orderNumber: "YOLO-20260318-004", date: "2026-03-18", status: "processing",
    items: [{ name: "スタンダードフィギュア", quantity: 1, price: 9800, imageUrl: petImages[0] }],
    total: 10300, shippingAddress: "福岡県福岡市中央区天神1-2-3", donationAmount: 515 },
  { id: "o5", orderNumber: "YOLO-20260315-005", date: "2026-03-15", status: "completed",
    items: [{ name: "Tシャツ", quantity: 1, price: 2980, imageUrl: petImages[0] }, { name: "クッション", quantity: 1, price: 2480, imageUrl: petImages[0] }],
    total: 5960, shippingAddress: "福岡県福岡市中央区天神1-2-3", donationAmount: 298 },
];

// ── Battles (8) ──
export const mockBattles: MockBattle[] = Array.from({ length: 8 }, (_, i) => ({
  id: `battle-${i + 1}`,
  pet1: { id: mockPets[i * 2].id, name: mockPets[i * 2].name, breed: mockPets[i * 2].breed, imageUrl: mockPets[i * 2].imageUrl, votes: 100 + (i * 47) % 400, ambassadorLevel: mockPets[i * 2].ambassadorLevel },
  pet2: { id: mockPets[i * 2 + 1].id, name: mockPets[i * 2 + 1].name, breed: mockPets[i * 2 + 1].breed, imageUrl: mockPets[i * 2 + 1].imageUrl, votes: 80 + (i * 53) % 450, ambassadorLevel: mockPets[i * 2 + 1].ambassadorLevel },
  round: i < 2 ? "決勝" : i < 4 ? "準決勝" : "準々決勝",
}));

// ── Crown History (7 days) ──
export const mockCrownHistory: MockCrownHistory[] = Array.from({ length: 7 }, (_, i) => {
  const pet = mockPets[i % 20];
  const d = new Date(2026, 2, 27 - i);
  return {
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    petId: pet.id, petName: pet.name, ownerName: pet.ownerName, imageUrl: pet.imageUrl,
    views: 5000 + (i * 1234) % 8000, likes: 200 + (i * 97) % 800,
    shares: 30 + (i * 23) % 150, mode: i % 3 === 0 ? "manual" as const : "auto" as const,
  };
});

// ── Dares (4 weeks) ──
const dareThemes = ["#おやつタイム", "#寝顔選手権", "#お散歩ベストショット", "#モフモフ大会"];
export const mockDares: MockDare[] = dareThemes.map((theme, i) => {
  const start = new Date(2026, 2, 27 - i * 7);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return {
    id: `dare-${i + 1}`, theme, hashtag: theme, description: `${theme} の写真を投稿しよう！`,
    startDate: start.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0],
    participants: 500 + (i * 234) % 2000, posts: 800 + (i * 456) % 5000,
    status: i === 0 ? "active" : i === 3 ? "draft" : "ended",
    rewards: { first: 500, second: 300, third: 300, participation: 50 },
    isDonationChallenge: i === 0 || i === 2,
  };
});

// ── Admin Users (20) ──
const adminUserDefs = [
  "田中 ユイ", "佐藤 サキ", "山田 タケシ", "高橋 アヤ", "鈴木 ケンジ",
  "伊藤 マサト", "渡辺 ミカ", "中村 ユウタ", "小林 ナナ", "加藤 ショウ",
  "吉田 レイ", "山口 ダイキ", "松本 サヤ", "井上 ヒロミ", "木村 アキラ",
  "林 コウジ", "清水 ミホ", "斉藤 リョウ", "前田 ユカリ", "藤吉 ヒロシ",
];
const adminPlans: MockAdminUser["plan"][] = ["free", "free", "pro", "family", "plus", "free", "plus", "free", "pro", "free", "free", "plus", "free", "family", "free", "pro", "free", "plus", "free", "pro"];
export const mockAdminUsers: MockAdminUser[] = adminUserDefs.map((name, i) => ({
  id: `user-${i + 1}`, name, email: `user${i + 1}@yolo.jp`, plan: adminPlans[i],
  petCount: 1 + (i % 3), arpu: adminPlans[i] === "free" ? 0 : adminPlans[i] === "plus" ? 480 : adminPlans[i] === "pro" ? 1480 : 2980,
  registeredAt: new Date(2026, 0, 1 + i * 4).toISOString().split("T")[0],
  lastLogin: new Date(2026, 2, 27 - (i % 5)).toISOString().split("T")[0],
  postCount: 5 + (i * 7) % 50, likeCount: 20 + (i * 31) % 200, crownCount: i < 3 ? 1 : 0,
  pets: [{ name: mockPets[i % 20].name, species: mockPets[i % 20].species, breed: mockPets[i % 20].breed }],
  donationTotal: adminPlans[i] === "free" ? 0 : adminPlans[i] === "plus" ? 480 + i * 50 : adminPlans[i] === "pro" ? 1480 + i * 120 : 2980 + i * 200,
  ambassadorLevel: i === 0 ? 3 : i === 2 ? 4 : i === 3 ? 5 : i < 8 ? 2 : i < 12 ? 1 : 0,
}));

// ── Reports (5) ──
export const mockReports: MockReport[] = [
  { id: "r1", postId: "post-5", postImage: mockPosts[4].imageUrl, reporterName: "匿名", reason: "不適切なコンテンツ", date: "2026-03-26", status: "pending", targetUser: "鈴木 ケンジ" },
  { id: "r2", postId: "post-12", postImage: mockPosts[11].imageUrl, reporterName: "田中 ユイ", reason: "スパム", date: "2026-03-25", status: "pending", targetUser: "吉田 レイ" },
  { id: "r3", postId: "post-8", postImage: mockPosts[7].imageUrl, reporterName: "佐藤 サキ", reason: "著作権侵害", date: "2026-03-24", status: "resolved", targetUser: "渡辺 ミカ" },
  { id: "r4", postId: "post-15", postImage: mockPosts[14].imageUrl, reporterName: "匿名", reason: "不適切なコンテンツ", date: "2026-03-22", status: "dismissed", targetUser: "井上 ヒロミ" },
  { id: "r5", postId: "post-20", postImage: mockPosts[19].imageUrl, reporterName: "山田 タケシ", reason: "その他", date: "2026-03-20", status: "pending", targetUser: "前田 ユカリ" },
];

// ── KPI Data (30 days) ──
export const mockKPIData: MockKPI[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 2, 27 - (29 - i));
  const base = 30000 + i * 150;
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    dau: base + Math.floor(Math.sin(i * 0.5) * 2000),
    mau: 75000 + i * 250,
    mrr: 3800000 + i * 15000,
    paidRate: 16 + i * 0.08,
    downloads: 20000 + i * 200,
    donationTotal: 380000 + i * 1500,
    donorCount: 12000 + i * 80,
  };
});

// ── Viral Data ──
export const mockViralLoops: MockViralLoop[] = [
  { name: "ベストショットシェア", kFactor: 0.60 },
  { name: "寄付バッジシェア", kFactor: 0.55 },
  { name: "ファミリー連鎖", kFactor: 0.80 },
  { name: "Crown通知", kFactor: 0.35 },
  { name: "Battle招待", kFactor: 0.45 },
  { name: "Dare参加呼びかけ", kFactor: 0.25 },
  { name: "グッズ写真シェア", kFactor: 0.15 },
  { name: "フォトブックギフト", kFactor: 0.10 },
  { name: "Letter共有", kFactor: 0.08 },
  { name: "Song共有", kFactor: 0.03 },
  { name: "ランキング報告", kFactor: 0.02 },
  { name: "口コミ紹介", kFactor: 0.01 },
  { name: "広告流入", kFactor: 0.00 },
];

export const mockShareDistribution = [
  { name: "LINE", value: 45, color: "#06C755" },
  { name: "Instagram", value: 25, color: "#E1306C" },
  { name: "TikTok", value: 15, color: "#000000" },
  { name: "Twitter", value: 10, color: "#1DA1F2" },
  { name: "その他", value: 5, color: "#999999" },
];

// ── Testimonials (LP) ──
export const testimonials = [
  { name: "田中 ユイ", age: 26, pet: "ルナ（スコティッシュフォールド）", stars: 5, comment: "3,000枚から選べないと思ってたけど、AIが一発で最高の1枚を選んでくれた！家族LINEに送ったら大盛り上がり😂", image: petImages[1] },
  { name: "高橋 アヤ", age: 34, pet: "ミミ（ラグドール）", stars: 5, comment: "忙しくて写真整理する時間なかったけど、YOLOなら3分で完了。フォトブックも簡単に作れて最高！", image: petImages[5] },
  { name: "藤吉 ヒロシ", age: 57, pet: "モカ（トイプードル）", stars: 5, comment: "孫に見せたら「おじいちゃんすごい！」って。フィギュアも作って玄関に飾ってます。毎日癒されます。", image: petImages[0] },
];

// ============================================================
// ★ DONATION DATA
// ============================================================

export const mockDonationTags: DonationTag[] = [
  { id: "dt1", tag: "#YOLO保護犬を救おう", label: "保護犬支援", posts: 342, donationTotal: 34200, isActive: true },
  { id: "dt2", tag: "#YOLO猫の命", label: "保護猫支援", posts: 198, donationTotal: 19800, isActive: true },
  { id: "dt3", tag: "#YOLOチャリティ", label: "総合チャリティ", posts: 156, donationTotal: 15600, isActive: true },
  { id: "dt4", tag: "#ロイヤルカナンYOLO", label: "ロイヤルカナン提供", posts: 0, donationTotal: 0, isActive: false, isSponsor: true, sponsorName: "ロイヤルカナン" },
];

export const mockNPOs: DonationNPO[] = [
  { id: "npo1", name: "NPO法人アニマルレスキュー福岡", location: "福岡県福岡市", target: "both", allocationPercent: 40, totalDonated: 5138800, bankInfo: "福岡銀行 天神支店 普通 1234567" },
  { id: "npo2", name: "一般社団法人にゃんこハウス東京", location: "東京都世田谷区", target: "cat", allocationPercent: 35, totalDonated: 4496450, bankInfo: "三菱UFJ銀行 渋谷支店 普通 7654321" },
  { id: "npo3", name: "公益財団法人いぬねこ共生センター", location: "大阪府大阪市", target: "dog", allocationPercent: 25, totalDonated: 3211750, bankInfo: "みずほ銀行 大阪支店 普通 9876543" },
];

export const mockDonationMonthly: DonationMonthly[] = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, 2 - i, 1);
  const month = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const sub = 800000 + (11 - i) * 50000;
  const goods = 120000 + (11 - i) * 8000;
  const add = 30000 + (11 - i) * 3000;
  return { month, fromSubscription: sub, fromGoods: goods, fromAdditional: add, fromSponsor: 0, total: sub + goods + add };
});

export const mockDonationReport: DonationReport = {
  id: "dr1", month: "2026/03", npoName: "NPO法人アニマルレスキュー福岡", npoLocation: "福岡県福岡市",
  text: "今月も皆さまのご支援のおかげで、保護犬12匹・保護猫8匹の食事を確保することができました。特に今月はYOLOのDareキャンペーンの効果で寄付額が前月比15%増加しました。救った動物たちは新しい飼い主さんのもとで元気に暮らしています。",
  images: [petImages[6], petImages[7], petImages[15]],
  dogCount: 12, catCount: 8, totalAmount: 523400,
};

export const mockDonationRankings: DonationRanking[] = mockPets.slice(0, 20).map((pet, i) => ({
  rank: i + 1, name: pet.ownerName, petName: pet.name, imageUrl: pet.imageUrl,
  amount: Math.max(100, 12000 - i * 550 + (i * 37) % 200),
  ambassadorLevel: pet.ambassadorLevel || 0,
}));

export const mockPersonalDonation: PersonalDonation[] = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, 2 - i, 1);
  const month = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return {
    month, fromSubscription: 148,
    fromGoods: i < 4 ? [120, 74, 0, 273][i] : 0,
    fromAdditional: i === 0 ? 74 : 0,
    total: 148 + (i < 4 ? [120, 74, 0, 273][i] : 0) + (i === 0 ? 74 : 0),
  };
});

export const mockDonationPool = {
  fromSubscription: 8234500, fromGoods: 1456200, fromAdditional: 345600, fromSponsor: 0,
  total: 10036300, lastExecutionDate: "2026-03-25", nextExecutionDate: "2026-04-25",
};

export const mockDonationExecutions = [
  { date: "2026-03-25", npo: "NPO法人アニマルレスキュー福岡", amount: 420000, status: "completed" as const },
  { date: "2026-03-25", npo: "一般社団法人にゃんこハウス東京", amount: 367500, status: "completed" as const },
  { date: "2026-03-25", npo: "公益財団法人いぬねこ共生センター", amount: 262500, status: "completed" as const },
  { date: "2026-02-25", npo: "NPO法人アニマルレスキュー福岡", amount: 380000, status: "completed" as const },
  { date: "2026-02-25", npo: "一般社団法人にゃんこハウス東京", amount: 332500, status: "completed" as const },
  { date: "2026-04-25", npo: "NPO法人アニマルレスキュー福岡", amount: 450000, status: "scheduled" as const },
];

// ============================================================
// ★ AMBASSADOR DATA
// ============================================================

export const ambassadorRanks: AmbassadorRank[] = [
  { level: 1, name: "サポーター", emoji: "🌱", requiredPlan: "Free会員OK", conditions: ["初回投稿"], benefits: ["寄付ダッシュボード閲覧"], donationMultiplier: 1 },
  { level: 2, name: "ガーディアン", emoji: "🌟", requiredPlan: "YOLO+以上必須", conditions: ["寄付タグ付き投稿10回", "YOLO+以上"], benefits: ["銀バッジ", "限定フレーム", "寄付レポート詳細"], donationMultiplier: 1.5 },
  { level: 3, name: "地域アンバサダー", emoji: "👑", requiredPlan: "PRO以上必須", conditions: ["フォロワー100人", "寄付貢献地域TOP", "PRO以上"], benefits: ["金バッジ", "地域枠（限定1名）", "Explore上位表示", "アンバサダー限定フレーム"], donationMultiplier: 2 },
  { level: 4, name: "マスター", emoji: "💎", requiredPlan: "PRO以上必須", conditions: ["紹介50人 or 寄付貢献TOP50", "PRO以上"], benefits: ["ダイヤバッジ", "YOLO運営直通チャット", "新機能先行アクセス", "限定イベント招待"], donationMultiplier: 3 },
  { level: 5, name: "レジェンド", emoji: "🏆", requiredPlan: "FAMILY必須", conditions: ["年間寄付貢献TOP10 or 紹介100人", "FAMILY"], benefits: ["虹色バッジ", "公式パートナー", "グッズ無料", "保護施設訪問ツアー"], donationMultiplier: 5 },
];

const prefectureNames = [
  "北海道","青森","岩手","宮城","秋田","山形","福島","茨城","栃木","群馬","埼玉","千葉","東京","神奈川",
  "新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知","三重",
  "滋賀","京都","大阪","兵庫","奈良","和歌山","鳥取","島根","岡山","広島","山口",
  "徳島","香川","愛媛","高知","福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄",
];
const regionMap: Record<string, string> = {
  "北海道":"北海道","青森":"東北","岩手":"東北","宮城":"東北","秋田":"東北","山形":"東北","福島":"東北",
  "茨城":"関東","栃木":"関東","群馬":"関東","埼玉":"関東","千葉":"関東","東京":"関東","神奈川":"関東",
  "新潟":"中部","富山":"中部","石川":"中部","福井":"中部","山梨":"中部","長野":"中部","岐阜":"中部","静岡":"中部","愛知":"中部","三重":"中部",
  "滋賀":"近畿","京都":"近畿","大阪":"近畿","兵庫":"近畿","奈良":"近畿","和歌山":"近畿",
  "鳥取":"中国","島根":"中国","岡山":"中国","広島":"中国","山口":"中国",
  "徳島":"四国","香川":"四国","愛媛":"四国","高知":"四国",
  "福岡":"九州","佐賀":"九州","長崎":"九州","熊本":"九州","大分":"九州","宮崎":"九州","鹿児島":"九州","沖縄":"九州",
};

export const mockPrefectureAmbassadors: PrefectureAmbassador[] = prefectureNames.map((pref) => {
  const base: PrefectureAmbassador = { prefecture: pref, region: regionMap[pref] };
  if (pref === "福岡") base.dog = { name: "藤吉 ヒロシ", petName: "モカ", imageUrl: petImages[0], donationTotal: 2340, postCount: 47 };
  if (pref === "東京") base.cat = { name: "加藤 ショウ", petName: "コタロウ", imageUrl: petImages[10], donationTotal: 1890, postCount: 38 };
  return base;
});

export const mockLegends: LegendEntry[] = [
  { name: "清水 ミホ", petName: "タマ", imageUrl: petImages[17], totalDonation: 45600, badge: "🏆" },
  { name: "松本 サヤ", petName: "メル", imageUrl: petImages[13], totalDonation: 38900, badge: "🏆" },
  { name: "高橋 アヤ", petName: "ミミ", imageUrl: petImages[5], totalDonation: 32100, badge: "🏆" },
  { name: "山田 タケシ", petName: "チョコ", imageUrl: petImages[2], totalDonation: 28500, badge: "🏆" },
  { name: "鈴木 ケンジ", petName: "リク", imageUrl: petImages[4], totalDonation: 24200, badge: "🏆" },
];

// ============================================================
// ★ SPONSOR DATA
// ============================================================

export const mockSponsors: MockSponsor[] = [
  { id: "sp1", companyName: "ロイヤルカナン", budget: 500000, tag: "#ロイヤルカナンYOLO", targetPetType: "both", targetRegion: "全国", budgetAllocated: 0, startDate: "2026-07-01", endDate: "2026-09-30", status: "draft", npoId: "npo1", postCount: 0, impressions: 0, donationTotal: 0 },
  { id: "sp2", companyName: "アイリスオーヤマ", budget: 300000, tag: "#アイリスYOLOペット", targetPetType: "dog", targetRegion: "全国", budgetAllocated: 0, startDate: "2026-08-01", endDate: "2026-10-31", status: "draft", npoId: "npo3", postCount: 0, impressions: 0, donationTotal: 0 },
];

// ============================================================
// ★ GOODS DATA (Partner Integration)
// ============================================================

export interface Photobook {
  id: string; name: string; subtitle: string; price: number;
  size: string; pages: string; imageUrl: string; tier: string;
  donationAmount: number; description: string; partner: string;
}

export interface Goods2DItem {
  id: string; name: string; price: number; imageUrl: string;
  description: string; size: string; donationPercent: number; partner: string;
}

export interface Goods3DItem {
  id: string; name: string; price: number; imageUrl: string;
  description: string; size: string; donationPercent: number; partner: string;
}

export const photobooks: Photobook[] = [
  {
    id: "book-pocket",
    name: "POCKET（ポケット）",
    subtitle: "手のひらサイズ。持ち歩ける思い出",
    price: 980,
    size: "L判（89×127mm）",
    pages: "16〜36ページ",
    imageUrl: "https://www.photoback.jp/assets/images/book/pocket/pocket_main.jpg",
    tier: "シンプル",
    donationAmount: 49,
    description: "ポケットに入れて持ち歩けるL判サイズ。馴染みやすさと可愛らしさが人気",
    partner: "Photoback（MONO-LINK）",
  },
  {
    id: "book-bunko",
    name: "BUNKO（ブンコ）",
    subtitle: "文庫本スタイル。帯付きの本格派",
    price: 2980,
    size: "文庫判（105×148mm）",
    pages: "16〜48ページ",
    imageUrl: "https://www.photoback.jp/assets/images/book/bunko/bunko_main.jpg",
    tier: "コラージュ",
    donationAmount: 149,
    description: "文庫本をイメージした帯付きフォトブック。日常が特別な物語に",
    partner: "Photoback（MONO-LINK）",
  },
  {
    id: "book-life",
    name: "LIFE（ライフ）",
    subtitle: "A5判の大人気アイテム。最大120P",
    price: 4980,
    size: "A5判（148×210mm）",
    pages: "36〜120ページ",
    imageUrl: "https://www.photoback.jp/assets/images/book/life/life_main.jpg",
    tier: "プレミアム",
    donationAmount: 249,
    description: "存在感のあるA5判。帯付き。家族の記録から旅行記まで大人気",
    partner: "Photoback（MONO-LINK）",
  },
];

export const goods2D: Goods2DItem[] = [
  {
    id: "goods-acrylic",
    name: "アクリルスタンド",
    price: 480,
    imageUrl: "https://originalprint.jp/img/item/acrylic-stand-s/acrylic-stand-s-main.jpg",
    description: "デスクに飾れるSサイズ。ベストショットがアクスタに",
    size: "70×70mm",
    donationPercent: 5,
    partner: "ORIGINALPRINT.jp（イメージ・マジック）",
  },
  {
    id: "goods-mug",
    name: "マグカップ",
    price: 1480,
    imageUrl: "https://originalprint.jp/img/item/mug-cup/mug-cup-main.jpg",
    description: "毎朝のコーヒーをうちの子と。フルカラープリント",
    size: "直径82mm×高さ95mm",
    donationPercent: 5,
    partner: "ORIGINALPRINT.jp（イメージ・マジック）",
  },
  {
    id: "goods-tshirt",
    name: "Tシャツ",
    price: 2980,
    imageUrl: "https://originalprint.jp/img/item/t-shirt/t-shirt-main.jpg",
    description: "お散歩コーデに。ペットの写真をフルカラーで",
    size: "S / M / L / XL",
    donationPercent: 5,
    partner: "ORIGINALPRINT.jp（イメージ・マジック）",
  },
  {
    id: "goods-phonecase",
    name: "スマホケース",
    price: 1980,
    imageUrl: "https://originalprint.jp/img/item/smartphone-case/smartphone-case-main.jpg",
    description: "いつも一緒に。ハードカバーケース",
    size: "iPhone / Android対応",
    donationPercent: 5,
    partner: "ORIGINALPRINT.jp（イメージ・マジック）",
  },
  {
    id: "goods-cushion",
    name: "クッション",
    price: 2480,
    imageUrl: "https://originalprint.jp/img/item/cushion/cushion-main.jpg",
    description: "ソファに置きたい。フルカラー両面プリント",
    size: "40×40cm",
    donationPercent: 5,
    partner: "ORIGINALPRINT.jp（イメージ・マジック）",
  },
  {
    id: "goods-towel",
    name: "フォトタオル",
    price: 5980,
    imageUrl: "https://originalprint.jp/img/item/bath-towel/bath-towel-main.jpg",
    description: "バスタオルサイズ。高品質フルカラー",
    size: "60×120cm",
    donationPercent: 5,
    partner: "ORIGINALPRINT.jp（イメージ・マジック）",
  },
];

export const goods3D: Goods3DItem[] = [
  {
    id: "goods-figure-mini",
    name: "ミニフィギュア",
    price: 2980,
    imageUrl: "https://make.dmm.com/assets/img/top/hero_3dprint.jpg",
    description: "デスクに飾れる3cmサイズ。写真から3Dモデル生成",
    size: "約3cm",
    donationPercent: 5,
    partner: "DMM.make 3Dプリント",
  },
  {
    id: "goods-figure-standard",
    name: "スタンダードフィギュア",
    price: 9800,
    imageUrl: "https://make.dmm.com/assets/img/top/hero_3dprint.jpg",
    description: "リビングに飾れる7cmサイズ。精密な造形",
    size: "約7cm",
    donationPercent: 5,
    partner: "DMM.make 3Dプリント",
  },
  {
    id: "goods-figure-premium",
    name: "プレミアムフィギュア",
    price: 19800,
    imageUrl: "https://make.dmm.com/assets/img/top/hero_3dprint.jpg",
    description: "プレゼントに最適。12cmの大型精密フィギュア",
    size: "約12cm",
    donationPercent: 5,
    partner: "DMM.make 3Dプリント",
  },
];
