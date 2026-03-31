import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();

    const [
      { count: totalUsers },
      { count: paidUsers },
      { count: totalPosts },
      { count: totalOrders },
    ] = await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .neq("plan", "free"),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
    ]);

    const { data: donationData } = await supabaseAdmin.from("npos").select("total_donated");
    const totalDonation = (donationData || []).reduce((s, n) => s + n.total_donated, 0);

    const { data: revenueData } = await supabaseAdmin
      .from("orders")
      .select("total")
      .eq("status", "processing");
    const totalRevenue = (revenueData || []).reduce((s, o) => s + o.total, 0);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      paidUsers: paidUsers || 0,
      paidRate: totalUsers ? Math.round(((paidUsers || 0) / totalUsers) * 100) : 0,
      totalPosts: totalPosts || 0,
      totalOrders: totalOrders || 0,
      totalDonation,
      totalRevenue,
    });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/stats] Error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
