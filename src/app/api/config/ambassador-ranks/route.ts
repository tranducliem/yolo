import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AmbassadorRank } from "@/types";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ambassador_ranks")
    .select("level, name, emoji, required_plan, conditions, benefits, donation_multiplier")
    .order("level", { ascending: true });

  if (error) {
    return NextResponse.json({ ranks: [] }, { status: 200 });
  }

  const ranks: AmbassadorRank[] = (data ?? []).map((r) => ({
    level: r.level,
    name: r.name,
    emoji: r.emoji,
    requiredPlan: r.required_plan,
    conditions: r.conditions,
    benefits: r.benefits,
    donationMultiplier: Number(r.donation_multiplier),
  }));

  return NextResponse.json(
    { ranks },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
