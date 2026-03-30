import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "total";

    if (period === "total") {
      // Lifetime rankings
      const { data: rankings } = await supabaseAdmin
        .from("users")
        .select("id, display_name, avatar_url, donation_total, ambassador_level")
        .gt("donation_total", 0)
        .order("donation_total", { ascending: false })
        .limit(20);

      return NextResponse.json({
        rankings: (rankings || []).map((u, i) => ({
          rank: i + 1,
          userId: u.id.substring(0, 8),
          displayName: u.display_name,
          avatarUrl: u.avatar_url,
          totalDonated: u.donation_total,
          ambassadorLevel: u.ambassador_level,
        })),
      });
    }

    // Monthly rankings - aggregate donations for current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: monthlyData } = await supabaseAdmin
      .from("donations")
      .select("user_id, amount")
      .eq("month", currentMonth);

    // Aggregate by user
    const userTotals = new Map<string, number>();
    for (const d of monthlyData || []) {
      userTotals.set(d.user_id, (userTotals.get(d.user_id) || 0) + d.amount);
    }

    // Sort and get top 20
    const sorted = Array.from(userTotals.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    if (sorted.length === 0) {
      return NextResponse.json({ rankings: [] });
    }

    // Fetch user details
    const userIds = sorted.map(([id]) => id);
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, display_name, avatar_url, ambassador_level")
      .in("id", userIds);

    const userMap = new Map((users || []).map((u) => [u.id, u]));

    const rankings = sorted.map(([uid, amount], i) => {
      const u = userMap.get(uid);
      return {
        rank: i + 1,
        userId: uid.substring(0, 8),
        displayName: u?.display_name || "ユーザー",
        avatarUrl: u?.avatar_url,
        totalDonated: amount,
        ambassadorLevel: u?.ambassador_level || 0,
      };
    });

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error("[donation/ranking] Error:", error);
    return NextResponse.json({ error: "Failed to get rankings" }, { status: 500 });
  }
}
