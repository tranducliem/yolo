import { supabaseAdmin } from "@/lib/supabase/admin";

// Plan hierarchy — numeric comparison, NOT string comparison
const PLAN_RANK: Record<string, number> = { free: 0, plus: 1, pro: 2, family: 3 };

const LEVEL_NAMES = ["なし", "Supporter", "Guardian", "Regional Ambassador", "Master", "Legend"];
const MULTIPLIERS = [1, 1, 1.5, 2, 3, 5];

export interface AmbassadorStatus {
  currentLevel: number;
  levelName: string;
  multiplier: number;
  progress: {
    level: number;
    name: string;
    met: boolean;
    conditions: string[];
  }[];
}

export async function calculateAmbassadorLevel(userId: string): Promise<number> {
  // Get user info
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("plan, referral_count, donation_total")
    .eq("id", userId)
    .single();

  if (!user) return 0;

  const planRank = PLAN_RANK[user.plan] ?? 0;

  // Count donation-tagged posts (Phase 3 — returns 0 until posts table exists)
  let postCount = 0;
  try {
    const { count } = await supabaseAdmin
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    postCount = count || 0;
  } catch {
    // posts table doesn't exist yet — OK
  }

  // Count followers (Phase 3 — returns 0 until follows table exists)
  let followerCount = 0;
  try {
    const { count } = await supabaseAdmin
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", userId);
    followerCount = count || 0;
  } catch {
    // follows table doesn't exist yet — OK
  }

  // Get donation rank
  const donationRank = await getDonationRank(userId, user.donation_total);

  const referralCount = user.referral_count || 0;

  // Level 5: Family + (top 10 donor OR 100 referrals)
  if (planRank >= PLAN_RANK.family && (donationRank <= 10 || referralCount >= 100)) return 5;
  // Level 4: Pro+ + (50 referrals OR top 50 donor)
  if (planRank >= PLAN_RANK.pro && (referralCount >= 50 || donationRank <= 50)) return 4;
  // Level 3: Pro+ + 100 followers
  if (planRank >= PLAN_RANK.pro && followerCount >= 100) return 3;
  // Level 2: Plus+ + 10 donation-tagged posts
  if (planRank >= PLAN_RANK.plus && postCount >= 10) return 2;
  // Level 1: First post
  if (postCount >= 1) return 1;

  return 0;
}

async function getDonationRank(userId: string, userTotal: number): Promise<number> {
  if (userTotal <= 0) return 999;

  const { count } = await supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true })
    .gt("donation_total", userTotal);

  return (count || 0) + 1;
}

export async function getAmbassadorStatus(userId: string): Promise<AmbassadorStatus> {
  const level = await calculateAmbassadorLevel(userId);

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("plan, referral_count, donation_total")
    .eq("id", userId)
    .single();

  const referralCount = user?.referral_count || 0;

  const progress = [
    { level: 1, name: "Supporter", met: level >= 1, conditions: ["初めての投稿"] },
    {
      level: 2,
      name: "Guardian",
      met: level >= 2,
      conditions: ["YOLO+以上", "寄付タグ付き投稿10件"],
    },
    {
      level: 3,
      name: "Regional Ambassador",
      met: level >= 3,
      conditions: ["PRO以上", "フォロワー100人"],
    },
    {
      level: 4,
      name: "Master",
      met: level >= 4,
      conditions: [`PRO以上`, `紹介${referralCount}/50人 または 寄付トップ50`],
    },
    {
      level: 5,
      name: "Legend",
      met: level >= 5,
      conditions: [`FAMILY`, `紹介${referralCount}/100人 または 年間寄付トップ10`],
    },
  ];

  // Update user ambassador_level if changed
  await supabaseAdmin
    .from("users")
    .update({ ambassador_level: level })
    .eq("id", userId)
    .neq("ambassador_level", level);

  return {
    currentLevel: level,
    levelName: LEVEL_NAMES[level] || "なし",
    multiplier: MULTIPLIERS[level] || 1,
    progress,
  };
}
