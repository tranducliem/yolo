import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date(Date.now() - days * 86400000).toISOString();

    // New users per day
    const { data: signups } = await supabaseAdmin
      .from("users")
      .select("created_at")
      .gte("created_at", since)
      .order("created_at");

    // Orders per day
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("created_at, total")
      .gte("created_at", since)
      .order("created_at");

    // Donations per day
    const { data: donations } = await supabaseAdmin
      .from("donations")
      .select("created_at, amount")
      .gte("created_at", since)
      .order("created_at");

    return NextResponse.json({
      signups: signups || [],
      orders: orders || [],
      donations: donations || [],
      period: days,
    });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/analytics] Error:", error);
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
}
