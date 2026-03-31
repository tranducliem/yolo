import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("users")
      .select(
        "id, display_name, email, avatar_url, plan, ambassador_level, donation_total, paw_points, is_admin, is_banned, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (plan && plan !== "all") query = query.eq("plan", plan);
    if (search) query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data: users, count } = await query;

    return NextResponse.json({ users: users || [], total: count || 0 });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/users] Error:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}
