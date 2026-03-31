import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "12");

    // NPOs with totals
    const { data: npos } = await supabaseAdmin
      .from("npos")
      .select("*")
      .order("allocation_ratio", { ascending: false });

    // Monthly donation summary
    const { data: donations } = await supabaseAdmin
      .from("donations")
      .select("month, source, amount, executed")
      .order("month", { ascending: false })
      .limit(months * 100);

    // Group by month
    const monthlyMap = new Map<
      string,
      { membership: number; goods: number; additional: number; total: number }
    >();
    for (const d of donations || []) {
      const entry = monthlyMap.get(d.month) || { membership: 0, goods: 0, additional: 0, total: 0 };
      if (d.source === "membership") entry.membership += d.amount;
      else if (d.source === "goods") entry.goods += d.amount;
      else if (d.source === "additional") entry.additional += d.amount;
      entry.total += d.amount;
      monthlyMap.set(d.month, entry);
    }

    const monthly = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json({ npos: npos || [], monthly });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/donation] Error:", error);
    return NextResponse.json({ error: "Failed to get donation data" }, { status: 500 });
  }
}
