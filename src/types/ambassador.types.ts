export interface AmbassadorRank {
  level: number; name: string; emoji: string;
  requiredPlan: string; conditions: string[];
  benefits: string[]; donationMultiplier: number;
}

export interface PrefectureAmbassador {
  prefecture: string; region: string;
  dog?: { name: string; petName: string; imageUrl: string; donationTotal: number; postCount: number };
  cat?: { name: string; petName: string; imageUrl: string; donationTotal: number; postCount: number };
}

export interface LegendEntry {
  name: string; petName: string; imageUrl: string;
  totalDonation: number; badge: string;
}
