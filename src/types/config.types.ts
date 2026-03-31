export interface Tag {
  id: string;
  name: string;
  type: "normal" | "donation";
  emoji: string | null;
  sortOrder: number;
}
