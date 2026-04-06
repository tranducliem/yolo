export type ArtStyleCategory = "popular" | "art" | "cute" | "cool" | "classic" | "seasonal";

export type ArtStyle = {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  category: ArtStyleCategory;
  isFree: boolean;
  badgeText?: string;
  bgColor: string;
  prompt: string;
  description: string;
};

export type ArtStyleCategoryInfo = {
  id: ArtStyleCategory;
  name: string;
  emoji: string;
};

export type ArtGenerateRequest = {
  petName: string;
  photo: string; // base64
  styleId: string;
};

export type ArtGenerateResponse = {
  imageUrl: string; // generated illustration (with watermark)
  imageUrlHD: string | null; // HD version (after payment)
  breed: string;
  species: string;
  comment: string;
  styleId: string;
  styleName: string;
};

export type ArtResult = {
  id: string;
  imageUrl: string;
  imageUrlHD: string | null;
  originalPhoto: string;
  petName: string;
  breed: string;
  species: string;
  comment: string;
  styleId: string;
  styleName: string;
  createdAt: number;
};
