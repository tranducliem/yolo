export interface StudioStyle {
  id: string;
  name: string;
  emoji: string;
  filter: string;
}

export const studioStyles: StudioStyle[] = [
  { id: "oil", name: "油絵", emoji: "🎨", filter: "saturate(1.5) contrast(1.3)" },
  {
    id: "watercolor",
    name: "水彩",
    emoji: "💧",
    filter: "brightness(1.1) saturate(0.8) blur(0.5px)",
  },
  {
    id: "anime",
    name: "アニメ",
    emoji: "🌸",
    filter: "saturate(1.8) contrast(1.2) brightness(1.1)",
  },
  { id: "ukiyoe", name: "浮世絵", emoji: "🏯", filter: "sepia(0.6) saturate(1.5) contrast(1.4)" },
  {
    id: "popart",
    name: "ポップアート",
    emoji: "🎭",
    filter: "saturate(2.5) contrast(1.5) hue-rotate(30deg)",
  },
  {
    id: "stained",
    name: "ステンドグラス",
    emoji: "🌈",
    filter: "saturate(2) contrast(1.8) brightness(0.9)",
  },
];
