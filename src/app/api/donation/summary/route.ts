import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("id, donation_total, ambassador_level")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get monthly breakdown (last 12 months)
    const { data: donations } = await supabaseAdmin
      .from("donations")
      .select("month, source, amount")
      .eq("user_id", profile.id)
      .order("month", { ascending: false })
      .limit(200);

    // Group by month and source
    const monthlyMap = new Map<
      string,
      { fromSubscription: number; fromGoods: number; fromAdditional: number }
    >();
    for (const d of donations || []) {
      const entry = monthlyMap.get(d.month) || {
        fromSubscription: 0,
        fromGoods: 0,
        fromAdditional: 0,
      };
      if (d.source === "membership") entry.fromSubscription += d.amount;
      else if (d.source === "goods") entry.fromGoods += d.amount;
      else if (d.source === "additional") entry.fromAdditional += d.amount;
      monthlyMap.set(d.month, entry);
    }

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        total: data.fromSubscription + data.fromGoods + data.fromAdditional,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);

    // Calculate totals by source
    const totals = { fromSubscription: 0, fromGoods: 0, fromAdditional: 0 };
    for (const d of donations || []) {
      if (d.source === "membership") totals.fromSubscription += d.amount;
      else if (d.source === "goods") totals.fromGoods += d.amount;
      else if (d.source === "additional") totals.fromAdditional += d.amount;
    }

    // Estimate animals helped (avg meal cost = ¥100)
    const animalsHelped = Math.floor(profile.donation_total / 100);

    // Ambassador multiplier
    const multipliers = [1, 1, 1.2, 1.5, 2, 3];
    const ambassadorMultiplier = multipliers[profile.ambassador_level] || 1;

    return NextResponse.json({
      totalDonated: profile.donation_total,
      animalsHelped,
      monthlyBreakdown,
      totals,
      ambassadorMultiplier,
    });
  } catch (error) {
    console.error("[donation/summary] Error:", error);
    return NextResponse.json({ error: "Failed to get summary" }, { status: 500 });
  }
}
