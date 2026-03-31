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
