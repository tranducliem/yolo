import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  // Get current month's donation summary
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: donations } = await supabaseAdmin
    .from("donations")
    .select("amount, source, npo_id")
    .gte("created_at", startOfMonth)
    .eq("status", "executed");

  const totalAmount = (donations ?? []).reduce((sum, d) => sum + (d.amount || 0), 0);
  const membershipAmount = (donations ?? [])
    .filter((d) => d.source === "membership")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const goodsAmount = (donations ?? [])
    .filter((d) => d.source === "goods")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // Get NPO breakdown
  const { data: npos } = await supabaseAdmin.from("npos").select("id, name, total_donated");

  return NextResponse.json({
    report: {
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      totalAmount,
      membershipAmount,
      goodsAmount,
      animalsHelped: Math.floor(totalAmount / 100),
      npos: (npos ?? []).map((n) => ({
        name: n.name,
        totalDonated: n.total_donated ?? 0,
      })),
    },
  });
}
