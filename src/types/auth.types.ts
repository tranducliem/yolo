export interface YoloUser {
  id: string;
  authId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: "free" | "plus" | "pro" | "family";
  ambassadorLevel: number;
  ambassadorRegion: string | null;
  ambassadorCategory: string | null;
  pawPoints: number;
  bestshotCountThisMonth: number;
  donationTotal: number;
  referralCode: string | null;
  referralCount: number;
  battleVotesToday: number;
  isBanned: boolean;
  isAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  pets: YoloPet[];

  // Legacy compat fields (derived, not stored in DB)
  // These allow gradual migration — pages can still use user.name / user.petName
  name: string;
  petName: string;
  loggedIn: boolean;
  donationCount: number;
}

export interface YoloPet {
  id: string;
  name: string;
  type: "dog" | "cat" | "other";
  breed: string | null;
  birthday: string | null;
  gender: "male" | "female" | "unknown" | null;
  avatarUrl: string | null;
  isPublic: boolean;
}

export interface CartItem {
  id: string;
  goodsId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variant?: string;
}
