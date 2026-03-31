import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: npos } = await supabaseAdmin
      .from("npos")
      .select("id, name, region, target, allocation_ratio, total_donated, is_active")
      .eq("is_active", true)
      .order("allocation_ratio", { ascending: false });

    return NextResponse.json({
      npos: (npos || []).map((n) => ({
        id: n.id,
        name: n.name,
        location: n.region,
        target: n.target,
        allocationPercent: n.allocation_ratio,
        totalDonated: n.total_donated,
      })),
    });
  } catch (error) {
    console.error("[donation/npos] Error:", error);
    return NextResponse.json({ error: "Failed to get NPOs" }, { status: 500 });
  }
}
