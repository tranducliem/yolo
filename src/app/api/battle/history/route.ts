import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("battle_matches")
    .select(
      "id, week_of, pet1_id, pet2_id, pet1_votes, pet2_votes, winner_pet_id, round, status, created_at",
    )
    .eq("status", "completed")
    .order("week_of", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ history: [] });
  }

  return NextResponse.json({
    history: (data ?? []).map((m) => ({
      id: m.id,
      weekOf: m.week_of,
      pet1Id: m.pet1_id,
      pet2Id: m.pet2_id,
      pet1Votes: m.pet1_votes,
      pet2Votes: m.pet2_votes,
      winnerPetId: m.winner_pet_id,
      round: m.round,
      createdAt: m.created_at,
    })),
  });
}
