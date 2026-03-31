import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: dares } = await supabaseAdmin
      .from("dares")
      .select("*")
      .eq("status", "active")
      .order("end_date", { ascending: true })
      .limit(5);

    return NextResponse.json({ dares: dares || [] });
  } catch (error) {
    console.error("[dare/current] Error:", error);
    return NextResponse.json({ error: "Failed to get dares" }, { status: 500 });
  }
}
