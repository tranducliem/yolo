export interface MockBattle {
  id: string;
  pet1: { id: string; name: string; breed: string; imageUrl: string; votes: number; ambassadorLevel?: number };
  pet2: { id: string; name: string; breed: string; imageUrl: string; votes: number; ambassadorLevel?: number };
  round: string;
}

export interface MockCrownHistory {
  date: string; petId: string; petName: string; ownerName: string;
  imageUrl: string; views: number; likes: number; shares: number; mode: "auto" | "manual";
}

export interface MockDare {
  id: string; theme: string; hashtag: string; description: string;
  startDate: string; endDate: string; participants: number; posts: number;
  status: "scheduled" | "active" | "ended" | "draft";
  rewards: { first: number; second: number; third: number; participation: number };
  isDonationChallenge?: boolean;
}

export interface MockNotification {
  id: string; type: "like" | "follow" | "crown" | "battle" | "dare" | "letter" | "song" | "order" | "system" | "donation";
  icon: string; text: string; time: string; read: boolean; link: string;
}
