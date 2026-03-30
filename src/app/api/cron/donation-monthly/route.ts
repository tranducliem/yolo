import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Idempotency check: see if membership donations already exist for this month
    const { count: existingCount } = await supabaseAdmin
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("source", "membership")
      .eq("month", currentMonth)
      .eq("executed", true);

    if (existingCount && existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Already executed for ${currentMonth}`,
        usersProcessed: 0,
        totalDonated: 0,
      });
    }

    // Get all active paid subscribers
    const { data: subscribers } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, plan, donation_per_month")
      .neq("plan", "free")
      .eq("cancel_at_period_end", false);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active paid subscribers",
        usersProcessed: 0,
        totalDonated: 0,
      });
    }

    // Get active NPOs with allocation ratios
    const { data: npos } = await supabaseAdmin
      .from("npos")
      .select("id, allocation_ratio")
      .eq("is_active", true)
      .order("allocation_ratio", { ascending: false });

    if (!npos || npos.length === 0) {
      return NextResponse.json({ error: "No active NPOs found" }, { status: 500 });
    }

    const totalRatio = npos.reduce((sum, n) => sum + n.allocation_ratio, 0);

    // Step 1: Create membership donation rows for each subscriber
    let membershipTotal = 0;
    const donationRows = subscribers
      .filter((s) => s.donation_per_month > 0)
      .map((s) => {
        membershipTotal += s.donation_per_month;
        return {
          user_id: s.user_id,
          source: "membership",
          amount: s.donation_per_month,
          month: currentMonth,
          executed: false,
        };
      });

    if (donationRows.length > 0) {
      await supabaseAdmin.from("donations").insert(donationRows);
    }

    // Step 2: Collect all unexecuted donations for this month (membership + goods)
    const { data: pendingDonations } = await supabaseAdmin
      .from("donations")
      .select("id, user_id, amount")
      .eq("month", currentMonth)
      .eq("executed", false);

    const totalPool = pendingDonations?.reduce((sum, d) => sum + d.amount, 0) || 0;

    // Step 3: Distribute to NPOs based on allocation_ratio
    for (const npo of npos) {
      const allocated = Math.round((totalPool * npo.allocation_ratio) / totalRatio);
      if (allocated > 0) {
        await supabaseAdmin.rpc("increment_npo_total", {
          npo_id_input: npo.id,
          amount_input: allocated,
        });
      }
    }

    // Step 4: Mark all pending donations as executed
    if (pendingDonations && pendingDonations.length > 0) {
      const ids = pendingDonations.map((d) => d.id);
      await supabaseAdmin
        .from("donations")
        .update({ executed: true, executed_at: new Date().toISOString() })
        .in("id", ids);
    }

    // Step 5: Update each user's donation_total
    const userTotals = new Map<string, number>();
    for (const d of pendingDonations || []) {
      userTotals.set(d.user_id, (userTotals.get(d.user_id) || 0) + d.amount);
    }

    for (const [userId, total] of userTotals) {
      await supabaseAdmin.rpc("increment_user_donation", {
        user_id_input: userId,
        amount_input: total,
      });
    }

    return NextResponse.json({
      success: true,
      month: currentMonth,
      usersProcessed: donationRows.length,
      totalDonated: totalPool,
      membershipDonations: membershipTotal,
      pendingDonationsExecuted: pendingDonations?.length || 0,
    });
  } catch (error) {
    console.error("[cron/donation-monthly] Error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
