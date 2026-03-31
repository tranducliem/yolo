import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Get current week identifier
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
    );
    const currentWeek = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    const { data: matches } = await supabaseAdmin
      .from("battle_matches")
      .select(
        `
        *,
        pet1:pets!battle_matches_pet1_id_fkey(id, name, avatar_url, type, breed),
        pet2:pets!battle_matches_pet2_id_fkey(id, name, avatar_url, type, breed)
      `,
      )
      .eq("week", currentWeek)
      .eq("status", "active")
      .order("round");

    return NextResponse.json({ matches: matches || [], week: currentWeek });
  } catch (error) {
    console.error("[battle/current] Error:", error);
    return NextResponse.json({ error: "Failed to get battles" }, { status: 500 });
  }
}
