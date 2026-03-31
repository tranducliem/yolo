import Stripe from "stripe";

// Server-side Stripe client (use in API routes only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe Price IDs (created in Stripe Dashboard)
export const STRIPE_PRICES = {
  plus_monthly: "price_1TGhywGflqg5ErCq9bAve93w",
  plus_yearly: "price_1TGhywGflqg5ErCq6yoJ7UyC",
  pro_monthly: "price_1TGhyxGflqg5ErCqB1u4tpfH",
  pro_yearly: "price_1TGhyxGflqg5ErCqfwUmzS0d",
  family_monthly: "price_1TGhyyGflqg5ErCqboBSPnRC",
  family_yearly: "price_1TGhyyGflqg5ErCq2IZ6kKoy",
} as const;

// Plan key → Price ID mapping
export function getPriceId(plan: "plus" | "pro" | "family", cycle: "monthly" | "yearly"): string {
  const key = `${plan}_${cycle}` as keyof typeof STRIPE_PRICES;
  return STRIPE_PRICES[key];
}

// Plan → donation amount mapping (10% of monthly price)
export const DONATION_PER_MONTH: Record<string, number> = {
  free: 0,
  plus: 48,
  pro: 148,
  family: 298,
};
