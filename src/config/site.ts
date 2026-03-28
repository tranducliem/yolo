export const SITE_CONFIG = {
  name: "YOLO",
  tagline: "ずっと、ともに。",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  domain: "yolo.jp",
  company: "GXO株式会社",
} as const;

export const API_CONFIG = {
  analyzeEndpoint: "/api/analyze",
  maxDuration: 60,
  claudeModel: "claude-sonnet-4-20250514",
  maxOutputTokens: 2000,
} as const;

export const LIMITS = {
  freeTriesPerMonth: 3,
  freeBattleVotesPerDay: 5,
  maxPhotosPerAnalysis: 20,
  minPhotosPerAnalysis: 1,
  maxPhotoSizeMB: 5,
  apiImageMaxWidth: 1024,
  previewImageMaxWidth: 600,
  freeShippingThreshold: 5000,
  shippingFee: 500,
  giftWrapFee: 300,
  expressShippingFee: 1200,
  donationPercentGoods: 0.05,
  donationPercentSubscription: 0.10,
} as const;
