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
      .select("id, plan")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    return NextResponse.json({
      plan: profile.plan,
      billingCycle: sub?.billing_cycle || null,
      currentPeriodEnd: sub?.current_period_end || null,
      cancelAtPeriodEnd: sub?.cancel_at_period_end || false,
      donationPerMonth: sub?.donation_per_month || 0,
    });
  } catch (error) {
    console.error("[subscription/status] Error:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
