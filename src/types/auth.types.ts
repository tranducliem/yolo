export interface YoloUser {
  name: string;
  petName: string;
  loggedIn: boolean;
  createdAt: string;
  plan: "free" | "plus" | "pro" | "family";
  ambassadorLevel: number;
  ambassadorRegion?: string;
  donationTotal: number;
  donationCount: number;
}

export interface CartItem {
  id: string; goodsId: string; name: string; price: number;
  quantity: number; imageUrl: string; variant?: string;
}
