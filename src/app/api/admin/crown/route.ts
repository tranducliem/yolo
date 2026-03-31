import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

    const { data: history } = await supabaseAdmin
      .from("crown_history")
      .select("*, pets!inner(name, avatar_url, users!inner(display_name))")
      .order("date", { ascending: false })
      .limit(limit);

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/crown] Error:", error);
    return NextResponse.json({ error: "Failed to get crown history" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const { petId } = await request.json();

    if (!petId) {
      return NextResponse.json({ error: "petId required" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Upsert today's crown
    await supabaseAdmin
      .from("crown_history")
      .upsert({ pet_id: petId, date: today, mode: "manual" }, { onConflict: "date" });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/crown] Error:", error);
    return NextResponse.json({ error: "Failed to update crown" }, { status: 500 });
  }
}
