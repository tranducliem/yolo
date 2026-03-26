// ============================================================
// tomoni — Mock Data（全14画面で使用）
// ============================================================

export interface MockPet {
  id: string;
  name: string;
  species: "dog" | "cat";
  breed: string;
  ownerName: string;
  imageUrl: string;
  photos: string[];
  score: number;
  smileScore: number;
  loveScore: number;
  rareScore: number;
  followers: number;
  following: number;
  postCount: number;
  likeCount: number;
  pawPoints: number;
  crownCount: number;
  battleCount: number;
  dareCount: number;
  rankChange: number;
}

export interface MockPost {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  imageUrl: string;
  caption: string;
  tags: string[];
  emotions: { happy: number; funny: number; touched: number; crying: number };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  isBoosted?: boolean;
}

export interface MockGoods {
  id: string;
  name: string;
  price: number;
  category: "2d" | "3d" | "book";
  emoji: string;
  description: string;
  size?: string;
}

export interface MockBookTemplate {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
}

// ── Pets ── 犬10匹 + 猫10匹（Unsplash無料画像）
const dogPhotos = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1477884213360-7e9d7dcc8f9b?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=500&h=500&fit=crop",
];

const catPhotos = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&h=500&fit=crop",
];

const petDefs = [
  // 犬10匹
  { name: "モカ", species: "dog" as const, breed: "トイプードル", owner: "田中さくら" },
  { name: "ラテ", species: "dog" as const, breed: "柴犬", owner: "鈴木翔太" },
  { name: "コタロウ", species: "dog" as const, breed: "ゴールデンレトリバー", owner: "佐藤美咲" },
  { name: "マロン", species: "dog" as const, breed: "ミニチュアダックス", owner: "高橋遥" },
  { name: "チョコ", species: "dog" as const, breed: "ビーグル", owner: "伊藤健太" },
  { name: "ハナ", species: "dog" as const, breed: "ポメラニアン", owner: "渡辺あかり" },
  { name: "ソラ", species: "dog" as const, breed: "フレンチブルドッグ", owner: "山本大輝" },
  { name: "リク", species: "dog" as const, breed: "秋田犬", owner: "中村結衣" },
  { name: "フク", species: "dog" as const, breed: "コーギー", owner: "小林颯太" },
  { name: "レオ", species: "dog" as const, breed: "シバイヌ", owner: "加藤愛理" },
  // 猫10匹
  { name: "ミケ", species: "cat" as const, breed: "三毛猫", owner: "松本拓也" },
  { name: "ルナ", species: "cat" as const, breed: "ロシアンブルー", owner: "井上かなえ" },
  { name: "キナコ", species: "cat" as const, breed: "スコティッシュフォールド", owner: "木村真帆" },
  { name: "アズキ", species: "cat" as const, breed: "マンチカン", owner: "林太一" },
  { name: "モモ", species: "cat" as const, breed: "アメリカンショートヘア", owner: "斉藤勇気" },
  { name: "ユズ", species: "cat" as const, breed: "ペルシャ", owner: "藤田彩花" },
  { name: "サクラ", species: "cat" as const, breed: "ラグドール", owner: "岡田翼" },
  { name: "クロ", species: "cat" as const, breed: "黒猫", owner: "三浦楓" },
  { name: "シロ", species: "cat" as const, breed: "ブリティッシュショートヘア", owner: "前田陸" },
  { name: "チャチャ", species: "cat" as const, breed: "シャム猫", owner: "石井優奈" },
];

// 犬は0-9番目、猫は10-19番目
let dogIdx = 0;
let catIdx = 0;

export const mockPets: MockPet[] = petDefs.map((p, i) => {
  const isDog = p.species === "dog";
  const photoPool = isDog ? dogPhotos : catPhotos;
  const poolIdx = isDog ? dogIdx++ : catIdx++;
  const mainPhoto = photoPool[poolIdx % photoPool.length];
  // photos配列: メイン写真 + 他の写真からローテーション
  const photos = Array.from({ length: 9 }, (_, j) =>
    photoPool[(poolIdx + j) % photoPool.length]
  );
  return {
  id: `pet-${i + 1}`,
  name: p.name,
  species: p.species,
  breed: p.breed,
  ownerName: p.owner,
  imageUrl: mainPhoto,
  photos,
  score: 980 - i * 12 + (i % 5),
  smileScore: Math.min(5, 4 + (i < 5 ? 1 : 0)),
  loveScore: Math.min(5, 5 - (i > 10 ? 1 : 0)),
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
};});

// ── Posts (30) ──
const captions = [
  "今日のおやつタイム🍖", "お散歩日和☀️", "こっち見てくれた！📷",
  "お昼寝中zzz", "初めてのお洋服👗", "ボール遊びに夢中🎾",
  "窓辺でまったり🪟", "お風呂上がりのふわふわ✨", "今日は誕生日🎂",
  "新しいおもちゃに夢中🧸",
];

const tagPool = [
  "#tomoniDare", "#ベストショット", "#お散歩", "#おやつタイム",
  "#寝顔", "#お出かけ", "#おもしろ", "#モフモフ", "#親バカ", "#ペットのいる暮らし",
];

export const mockPosts: MockPost[] = Array.from({ length: 30 }, (_, i) => {
  const pet = mockPets[i % 20];
  return {
    id: `post-${i + 1}`,
    petId: pet.id,
    petName: pet.name,
    ownerName: pet.ownerName,
    imageUrl: pet.photos[i % pet.photos.length],
    caption: captions[i % captions.length],
    tags: [tagPool[i % tagPool.length], tagPool[(i + 3) % tagPool.length]],
    emotions: {
      happy: 10 + (i * 31) % 290,
      funny: 5 + (i * 17) % 145,
      touched: (i * 11) % 50,
      crying: (i * 7) % 20,
    },
    likes: 50 + (i * 53) % 950,
    comments: 5 + (i * 11) % 95,
    shares: (i * 7) % 50,
    createdAt: `${1 + (i * 3) % 23}時間前`,
    isBoosted: i % 7 === 0,
  };
});

// ── Goods ──
export const mockGoods: MockGoods[] = [
  { id: "g1", name: "アクリルスタンド", price: 1480, category: "2d", emoji: "🏷️", description: "透明アクリルにベストショットを印刷" },
  { id: "g2", name: "マグカップ", price: 1980, category: "2d", emoji: "☕", description: "毎日の癒しタイムに" },
  { id: "g3", name: "Tシャツ", price: 2980, category: "2d", emoji: "👕", description: "お気に入りの1枚をウェアに" },
  { id: "g4", name: "スマホケース", price: 1980, category: "2d", emoji: "📱", description: "いつも一緒に持ち歩ける" },
  { id: "g5", name: "クッション", price: 2480, category: "2d", emoji: "🛋️", description: "ふわふわ抱き心地" },
  { id: "g6", name: "フォトパネル", price: 3480, category: "2d", emoji: "🖼️", description: "インテリアにぴったり" },
  { id: "g7", name: "ミニフィギュア", price: 4980, category: "3d", emoji: "🎎", description: "手のひらサイズの可愛さ", size: "3cm" },
  { id: "g8", name: "スタンダードフィギュア", price: 9800, category: "3d", emoji: "🏆", description: "飾りやすいサイズ感", size: "7cm" },
  { id: "g9", name: "プレミアムフィギュア", price: 19800, category: "3d", emoji: "👑", description: "最高精度の再現", size: "12cm" },
];

// ── Book Templates ──
export const mockBookTemplates: MockBookTemplate[] = [
  { id: "b1", name: "シンプル", emoji: "📕", price: 1980, description: "シンプルで洗練されたデザイン" },
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
  { id: "recommend", label: "🔥おすすめ" },
  { id: "dog", label: "🐶犬" },
  { id: "cat", label: "🐱猫" },
  { id: "funny", label: "😂おもしろ" },
  { id: "sleeping", label: "😴寝顔" },
  { id: "walk", label: "🏃お散歩" },
  { id: "snack", label: "🍖おやつ" },
  { id: "crown", label: "👑Crown" },
  { id: "battle", label: "⚔️Battle" },
  { id: "dare", label: "🎯Dare" },
];

// ── Available Tags ──
export const availableTags = [
  "#tomoniDare", "#ベストショット", "#お散歩", "#おやつタイム",
  "#寝顔", "#お出かけ", "#おもしろ", "#モフモフ",
];
