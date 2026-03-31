import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();

    const { data: subscriptions } = await supabaseAdmin
      .from("subscriptions")
      .select("*, users!inner(display_name, email)")
      .neq("plan", "free")
      .order("created_at", { ascending: false });

    // Plan distribution
    const { data: allSubs } = await supabaseAdmin.from("subscriptions").select("plan");

    const planCounts: Record<string, number> = {};
    for (const s of allSubs || []) {
      planCounts[s.plan] = (planCounts[s.plan] || 0) + 1;
    }

    return NextResponse.json({
      subscriptions: subscriptions || [],
      planDistribution: planCounts,
    });
  } catch (error) {
    if (error instanceof AdminError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to get subscriptions" }, { status: 500 });
  }
}
