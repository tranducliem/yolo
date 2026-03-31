export interface MockGoods {
  id: string; name: string; price: number; category: "2d" | "3d" | "book";
  emoji: string; description: string; size?: string;
}

export interface MockBookTemplate {
  id: string; name: string; emoji: string; price: number; description: string;
}

export interface MockPlan {
  id: string; name: string; monthlyPrice: number; yearlyPrice: number;
  features: string[]; recommended?: boolean;
  donationAmount: number;
  donationStars: string;
  maxAmbassadorLevel: number;
}

export interface MockOrder {
  id: string; orderNumber: string; date: string;
  status: "new" | "processing" | "shipping" | "completed" | "cancelled";
  items: { name: string; quantity: number; price: number; imageUrl: string }[];
  total: number; shippingAddress: string; trackingNumber?: string;
  donationAmount: number;
}
