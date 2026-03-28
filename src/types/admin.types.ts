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

export interface MockViralLoop {
  name: string; kFactor: number;
}

export interface MockSponsor {
  id: string; companyName: string; budget: number; tag: string;
  targetAge?: string; targetGender?: string; targetPetType?: string;
  targetRegion?: string; budgetAllocated: number;
  startDate: string; endDate: string;
  status: "active" | "scheduled" | "ended" | "draft";
  npoId: string; postCount: number; impressions: number;
  donationTotal: number;
}
