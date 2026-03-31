export interface PhotoData {
  name: string;
  base64: string;
  type: string;
}

export interface AnalyzeRequest {
  photos: PhotoData[];
  petName: string;
}

export interface AnalyzeResult {
  photoIndex: number;
  totalScore: number;
  qualityScore: number;
  expressionScore: number;
  preferenceScore: number;
  smileRating: number;
  loveRating: number;
  rareRating: number;
  aiComment: string;
}

export interface AnalyzeResponse {
  success: boolean;
  mode: "live" | "mock";
  results: AnalyzeResult[];
  error?: string;
}

export interface ResultItem {
  rank: number;
  dataUrl: string;
  comment: string;
  smileScore: number;
  loveScore: number;
  rareScore: number;
}

export interface ProcessedPhoto {
  name: string;
  base64: string;
  type: string;
}

export interface StoreData {
  petName: string;
  images: string[];
}
