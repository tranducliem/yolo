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

    // Check admin
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("id, is_admin")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Gather KPIs
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

    // Total donation
    const { data: donationData } = await supabaseAdmin.from("npos").select("total_donated");

    const totalDonation = (donationData || []).reduce((s, n) => s + n.total_donated, 0);

    // Total revenue (orders)
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
    console.error("[admin/stats] Error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
