export interface DonationTag {
  id: string; tag: string; label: string; posts: number;
  donationTotal: number; isActive: boolean; isSponsor?: boolean;
  sponsorName?: string;
}

export interface DonationNPO {
  id: string; name: string; location: string; target: "dog" | "cat" | "both";
  allocationPercent: number; totalDonated: number; bankInfo: string;
}

export interface DonationMonthly {
  month: string; fromSubscription: number; fromGoods: number;
  fromAdditional: number; fromSponsor: number; total: number;
}

export interface DonationReport {
  id: string; month: string; npoName: string; npoLocation: string;
  text: string; images: string[]; dogCount: number; catCount: number;
  totalAmount: number;
}

export interface DonationRanking {
  rank: number; name: string; petName: string; imageUrl: string;
  amount: number; ambassadorLevel: number;
}

export interface PersonalDonation {
  month: string; fromSubscription: number; fromGoods: number;
  fromAdditional: number; total: number;
}
