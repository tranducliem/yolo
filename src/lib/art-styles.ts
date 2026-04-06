import { ArtStyle, ArtStyleCategoryInfo } from "@/types/art.types";

export const ART_STYLES: ArtStyle[] = [
  // === popular ===
  {
    id: "ghibli",
    name: "ジブリ風",
    nameEn: "Studio Ghibli Style",
    emoji: "🏔️",
    category: "popular",
    isFree: true,
    badgeText: "人気No.1",
    bgColor: "bg-emerald-50",
    prompt:
      "Studio Ghibli anime style illustration, soft watercolor textures, warm natural lighting, hand-painted feel, Hayao Miyazaki inspired, gentle and whimsical atmosphere, detailed background with nature elements",
    description: "温かみのあるジブリの世界観で描きます",
  },
  {
    id: "watercolor",
    name: "水彩画",
    nameEn: "Watercolor",
    emoji: "💧",
    category: "popular",
    isFree: true,
    badgeText: "",
    bgColor: "bg-blue-50",
    prompt:
      "Delicate watercolor painting style, soft flowing colors, wet-on-wet technique, translucent layers, artistic splashes and drips on edges, fine art quality, elegant and dreamy",
    description: "透明感のある水彩タッチで描きます",
  },
  {
    id: "pop",
    name: "ポップアート",
    nameEn: "Pop Art",
    emoji: "🎨",
    category: "popular",
    isFree: true,
    badgeText: "",
    bgColor: "bg-pink-50",
    prompt:
      "Vibrant pop art style, bold outlines, bright saturated colors, halftone dot patterns, Andy Warhol and Roy Lichtenstein inspired, comic book aesthetic, high contrast",
    description: "カラフルでビビッドなポップアートに",
  },
  {
    id: "oil",
    name: "油絵風",
    nameEn: "Oil Painting",
    emoji: "🖌️",
    category: "popular",
    isFree: true,
    badgeText: "",
    bgColor: "bg-amber-50",
    prompt:
      "Classical oil painting style, rich thick brushstrokes, impasto technique, warm golden lighting reminiscent of Dutch masters, museum quality portrait, deep shadows and luminous highlights",
    description: "重厚感のある油絵タッチで描きます",
  },
  // === art ===
  {
    id: "impressionist",
    name: "印象派",
    nameEn: "Impressionist",
    emoji: "🌸",
    category: "art",
    isFree: true,
    badgeText: "",
    bgColor: "bg-purple-50",
    prompt:
      "French Impressionist painting style, Claude Monet inspired, visible brushstrokes, emphasis on light and color, outdoor natural lighting, soft dreamy atmosphere, dappled sunlight effect",
    description: "モネのような光の表現で描きます",
  },
  {
    id: "ukiyoe",
    name: "浮世絵",
    nameEn: "Ukiyo-e",
    emoji: "🗻",
    category: "art",
    isFree: true,
    badgeText: "",
    bgColor: "bg-red-50",
    prompt:
      "Traditional Japanese ukiyo-e woodblock print style, flat colors, bold black outlines, Hokusai and Hiroshige inspired, traditional wave patterns, cherry blossoms, Japanese aesthetic",
    description: "日本の伝統的な浮世絵風に変換します",
  },
  {
    id: "pencil",
    name: "鉛筆デッサン",
    nameEn: "Pencil Sketch",
    emoji: "✏️",
    category: "art",
    isFree: true,
    badgeText: "",
    bgColor: "bg-gray-50",
    prompt:
      "Detailed pencil sketch drawing, graphite on white paper, fine hatching and cross-hatching, realistic proportions, artistic shading, professional illustrator quality, monochrome",
    description: "繊細な鉛筆デッサンで描きます",
  },
  {
    id: "woodcut",
    name: "版画風",
    nameEn: "Woodcut Print",
    emoji: "🪵",
    category: "art",
    isFree: false,
    badgeText: "",
    bgColor: "bg-stone-50",
    prompt:
      "Traditional woodcut print style, bold black and white contrast, carved texture, linocut aesthetic, strong graphic quality, limited color palette",
    description: "力強い版画のタッチで表現します",
  },
  {
    id: "stainedglass",
    name: "ステンドグラス",
    nameEn: "Stained Glass",
    emoji: "🪟",
    category: "art",
    isFree: false,
    badgeText: "",
    bgColor: "bg-violet-50",
    prompt:
      "Stained glass window style, bold black lead lines dividing colorful glass segments, jewel-toned translucent colors, cathedral window aesthetic, backlit effect, geometric shapes",
    description: "教会のステンドグラスのような美しさ",
  },
  {
    id: "warhol",
    name: "ウォーホル風",
    nameEn: "Andy Warhol Style",
    emoji: "🎭",
    category: "art",
    isFree: false,
    badgeText: "",
    bgColor: "bg-yellow-50",
    prompt:
      "Andy Warhol silk screen print style, 4-panel grid with different color combinations, high contrast portrait, neon colors, celebrity pop art aesthetic, bold and iconic",
    description: "ウォーホルの4色パネルアートに",
  },
  // === cute ===
  {
    id: "pixar",
    name: "ピクサー風3D",
    nameEn: "Pixar 3D Style",
    emoji: "🎬",
    category: "cute",
    isFree: true,
    badgeText: "",
    bgColor: "bg-cyan-50",
    prompt:
      "Pixar 3D animation style, soft rounded features, big expressive eyes, smooth plastic-like skin texture, professional studio lighting, heartwarming and cute character design, subsurface scattering on skin",
    description: "ピクサー映画のキャラクターのように",
  },
  {
    id: "storybook",
    name: "絵本イラスト",
    nameEn: "Storybook",
    emoji: "📖",
    category: "cute",
    isFree: true,
    badgeText: "NEW",
    bgColor: "bg-orange-50",
    prompt:
      "Children storybook illustration style, soft pastel colors, gentle rounded shapes, cozy warm atmosphere, hand-drawn feel, picture book quality, charming and innocent",
    description: "温かみのある絵本の世界に",
  },
  {
    id: "chibi",
    name: "ちびキャラ",
    nameEn: "Chibi",
    emoji: "🎀",
    category: "cute",
    isFree: false,
    badgeText: "",
    bgColor: "bg-rose-50",
    prompt:
      "Japanese chibi style, super deformed proportions with large head and small body, big sparkly eyes, kawaii aesthetic, cute and rounded features, anime manga style, pastel background",
    description: "キュートなちびキャラに変身",
  },
  {
    id: "linestamp",
    name: "LINE風スタンプ",
    nameEn: "LINE Sticker",
    emoji: "💬",
    category: "cute",
    isFree: false,
    badgeText: "",
    bgColor: "bg-lime-50",
    prompt:
      "LINE sticker style illustration, simple clean outlines, flat colors, expressive exaggerated emotions, white background, cute and minimal design, messaging sticker aesthetic",
    description: "LINEスタンプのような可愛いイラスト",
  },
  // === cool ===
  {
    id: "cyberpunk",
    name: "サイバーパンク",
    nameEn: "Cyberpunk",
    emoji: "🌃",
    category: "cool",
    isFree: false,
    badgeText: "",
    bgColor: "bg-indigo-50",
    prompt:
      "Cyberpunk futuristic style, neon lights in purple and cyan, rain-soaked streets, holographic elements, circuit board patterns, dystopian sci-fi atmosphere, blade runner aesthetic",
    description: "近未来のサイバーパンクの世界へ",
  },
  {
    id: "streetart",
    name: "ストリートアート",
    nameEn: "Street Art",
    emoji: "🧱",
    category: "cool",
    isFree: false,
    badgeText: "",
    bgColor: "bg-slate-50",
    prompt:
      "Urban street art graffiti style, spray paint textures, bold colors on brick wall, Banksy inspired, stencil art elements, edgy and rebellious, outdoor mural aesthetic",
    description: "ストリートの壁画アートに",
  },
  {
    id: "neon",
    name: "ネオン",
    nameEn: "Neon Glow",
    emoji: "💜",
    category: "cool",
    isFree: false,
    badgeText: "",
    bgColor: "bg-fuchsia-50",
    prompt:
      "Neon glow art style, glowing neon tube outlines on dark background, vibrant pink blue and purple, electric sign aesthetic, luminous and atmospheric, night club vibe",
    description: "光り輝くネオンアートに",
  },
  {
    id: "anime",
    name: "アニメ風",
    nameEn: "Anime Cel",
    emoji: "⚡",
    category: "cool",
    isFree: false,
    badgeText: "",
    bgColor: "bg-sky-50",
    prompt:
      "High quality Japanese anime cel shading style, vibrant colors, sharp clean lines, dramatic lighting, detailed eyes, wind-blown fur, sakura petals, anime movie poster quality",
    description: "アニメのワンシーンのように",
  },
  // === classic ===
  {
    id: "renaissance",
    name: "ルネサンス肖像画",
    nameEn: "Renaissance Portrait",
    emoji: "👑",
    category: "classic",
    isFree: false,
    badgeText: "",
    bgColor: "bg-amber-50",
    prompt:
      "Renaissance oil portrait painting, Leonardo da Vinci and Raphael inspired, sfumato technique, dark rich background, noble regal pose, golden frame worthy, museum masterpiece quality, dramatic chiaroscuro lighting",
    description: "ルネサンスの名画のような肖像に",
  },
  {
    id: "baroque",
    name: "バロック",
    nameEn: "Baroque",
    emoji: "🏛️",
    category: "classic",
    isFree: false,
    badgeText: "",
    bgColor: "bg-yellow-50",
    prompt:
      "Baroque painting style, Rembrandt inspired, dramatic contrast of light and shadow, ornate and luxurious, deep warm colors, theatrical lighting, royal aristocratic atmosphere",
    description: "レンブラントのような劇的な光と影",
  },
  {
    id: "artnouveau",
    name: "アールヌーヴォー",
    nameEn: "Art Nouveau",
    emoji: "🌿",
    category: "classic",
    isFree: false,
    badgeText: "",
    bgColor: "bg-teal-50",
    prompt:
      "Art Nouveau style, Alphonse Mucha inspired, flowing organic lines, floral and botanical decorative borders, pastel color palette, elegant ornamental frame, poster illustration aesthetic",
    description: "ミュシャのような装飾的な美しさ",
  },
  // === seasonal ===
  {
    id: "sakura",
    name: "桜（春限定）",
    nameEn: "Cherry Blossom Spring",
    emoji: "🌸",
    category: "seasonal",
    isFree: false,
    badgeText: "春限定",
    bgColor: "bg-pink-50",
    prompt:
      "Japanese cherry blossom spring theme, soft pink sakura petals floating in air, dreamy watercolor style, warm gentle sunlight, traditional Japanese garden background, seasonal spring atmosphere",
    description: "満開の桜に囲まれた春のイラスト",
  },
  {
    id: "hanabi",
    name: "花火（夏限定）",
    nameEn: "Fireworks Summer",
    emoji: "🎆",
    category: "seasonal",
    isFree: false,
    badgeText: "夏限定",
    bgColor: "bg-indigo-50",
    prompt:
      "Japanese summer fireworks festival theme, colorful fireworks exploding in night sky, festival lanterns, yukata atmosphere, warm summer night, nostalgic and beautiful Japanese summer",
    description: "夏祭りの花火と一緒に",
  },
  {
    id: "koyo",
    name: "紅葉（秋限定）",
    nameEn: "Autumn Leaves",
    emoji: "🍁",
    category: "seasonal",
    isFree: false,
    badgeText: "秋限定",
    bgColor: "bg-orange-50",
    prompt:
      "Japanese autumn foliage theme, vibrant red and golden maple leaves, warm sunset lighting, traditional Japanese garden with pond, peaceful autumn atmosphere, rich warm color palette",
    description: "紅葉の美しい秋の風景で",
  },
];

export const STYLE_CATEGORIES: ArtStyleCategoryInfo[] = [
  { id: "popular", name: "人気", emoji: "⭐" },
  { id: "art", name: "アート", emoji: "🎨" },
  { id: "cute", name: "かわいい", emoji: "💕" },
  { id: "cool", name: "カッコいい", emoji: "⚡" },
  { id: "classic", name: "クラシック", emoji: "👑" },
  { id: "seasonal", name: "季節限定", emoji: "🌸" },
];

export const FREE_STYLE_COUNT = ART_STYLES.filter((s) => s.isFree).length;
export const TOTAL_STYLE_COUNT = ART_STYLES.length;

// CSS filter presets for mock art generation (Phase 1)
export const STYLE_FILTERS: Record<string, string> = {
  ghibli: "saturate(1.4) hue-rotate(15deg) contrast(1.1) brightness(1.05)",
  watercolor: "saturate(0.7) brightness(1.15) contrast(0.9)",
  pop: "saturate(2.0) contrast(1.5) brightness(1.1)",
  oil: "saturate(1.3) contrast(1.25) brightness(0.95)",
  impressionist: "saturate(1.2) hue-rotate(10deg) brightness(1.1)",
  ukiyoe: "saturate(1.5) contrast(1.4) hue-rotate(-10deg)",
  pencil: "saturate(0) contrast(1.8) brightness(1.2)",
  pixar: "saturate(1.6) contrast(1.1) brightness(1.15)",
  storybook: "saturate(0.9) brightness(1.2) hue-rotate(5deg) contrast(0.95)",
  woodcut: "saturate(0) contrast(2.0) brightness(1.1)",
  stainedglass: "saturate(1.8) contrast(1.3) brightness(1.05)",
  warhol: "saturate(2.2) contrast(1.6) hue-rotate(30deg)",
  chibi: "saturate(1.4) brightness(1.15) contrast(1.05)",
  linestamp: "saturate(0.5) contrast(1.6) brightness(1.2)",
  cyberpunk: "saturate(1.5) hue-rotate(200deg) contrast(1.3) brightness(0.9)",
  streetart: "saturate(1.8) contrast(1.5) brightness(1.0)",
  neon: "saturate(2.0) hue-rotate(270deg) contrast(1.4) brightness(0.85)",
  anime: "saturate(1.6) contrast(1.2) brightness(1.1)",
  renaissance: "saturate(0.8) contrast(1.3) brightness(0.85) sepia(0.3)",
  baroque: "saturate(0.7) contrast(1.4) brightness(0.8) sepia(0.4)",
  artnouveau: "saturate(1.1) hue-rotate(20deg) contrast(1.1) brightness(1.05)",
  sakura: "saturate(1.2) hue-rotate(330deg) brightness(1.15) contrast(0.95)",
  hanabi: "saturate(1.4) hue-rotate(240deg) contrast(1.2) brightness(0.85)",
  koyo: "saturate(1.5) hue-rotate(350deg) contrast(1.15) brightness(1.0)",
};

// Mock comments per style for Phase 1
export const MOCK_COMMENTS: Record<string, string> = {
  ghibli:
    "ジブリの世界に飛び込んだ{petName}。風に揺れる毛並みと好奇心いっぱいの瞳が、まるでトトロの森で冒険中のようです。",
  watercolor:
    "透き通る水彩の色合いが{petName}の優しさを映し出しています。淡い光の中で微笑むその表情は、まるで夢の中の一枚。",
  pop: "ポップアートになった{petName}は、まるでアンディ・ウォーホルの新作。ビビッドな色彩がその個性を際立たせています。",
  oil: "美術館に飾られていてもおかしくない{petName}の油絵。重厚な筆致が気品ある雰囲気を演出しています。",
  impressionist: "光と影が織りなす{petName}の肖像。モネもきっと「素晴らしい」と微笑むでしょう。",
  ukiyoe: "北斎もびっくり、{petName}の浮世絵が完成。凛とした佇まいが江戸の風を感じさせます。",
  pencil:
    "一本一本の線が{petName}の魅力を繊細に描き出しています。鉛筆だけで表現されたこの温もりは格別です。",
  pixar:
    "ピクサーの新作主人公は{petName}。大きな瞳とふわふわの毛並みに、世界中が恋に落ちそうです。",
  storybook:
    "絵本の世界から飛び出してきた{petName}。この1ページが、きっと宝物の物語になるはずです。",
  woodcut:
    "力強い版画のタッチが{petName}の存在感を引き立てます。モノクロの世界に息づく生命力を感じてください。",
  stainedglass: "光を受けて輝くステンドグラスの中に{petName}が。教会の窓のような神聖な美しさです。",
  warhol:
    "4色に染まった{petName}はまさにポップカルチャーのアイコン。ウォーホルも嫉妬する仕上がりです。",
  chibi: "ちっちゃくなった{petName}が可愛すぎます！デフォルメされたお目目がたまらないキュートさ。",
  linestamp:
    "LINEスタンプになった{petName}を今すぐ送りたい！シンプルなのに愛嬌たっぷりの仕上がりです。",
  cyberpunk: "ネオンの街を駆ける{petName}。サイバーパンクの世界でもその可愛さは最強の武器です。",
  streetart:
    "街の壁に描かれた{petName}のグラフィティ。通りすがりの人も思わず立ち止まるアートです。",
  neon: "闇夜に輝くネオンの{petName}。光のラインが描く幻想的な姿に見とれてしまいます。",
  anime:
    "アニメの主人公になった{petName}。風になびく毛並みと輝く瞳が、最高のワンシーンを演出しています。",
  renaissance: "ルネサンスの巨匠も認める{petName}の肖像画。気品と威厳に満ちた一枚です。",
  baroque: "レンブラントの光と影が{petName}を包みます。劇的な陰影が生み出す深い存在感。",
  artnouveau:
    "ミュシャの花が{petName}を彩ります。流れるような曲線と装飾が、優雅な美しさを生み出しています。",
  sakura: "満開の桜の下で微笑む{petName}。春の風に舞う花びらとの共演は、まさに日本の春の美。",
  hanabi: "夏の夜空に咲く花火と{petName}。祭りの灯りに照らされた姿が、夏の思い出になります。",
  koyo: "紅葉に染まる{petName}の秋。赤や金色の葉に囲まれた姿は、まるで錦絵のような美しさ。",
};

export function getStyleById(id: string): ArtStyle | undefined {
  return ART_STYLES.find((s) => s.id === id);
}

export function getMockComment(styleId: string, petName: string): string {
  const template =
    MOCK_COMMENTS[styleId] ||
    "{petName}の素敵なイラストが完成しました。世界に一つだけのアート作品をお楽しみください。";
  return template.replace(/{petName}/g, petName);
}
