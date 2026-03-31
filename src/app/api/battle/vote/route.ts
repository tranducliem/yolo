import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("id, plan")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { matchId, petId } = await request.json();

    if (!matchId || !petId) {
      return NextResponse.json({ error: "Missing matchId or petId" }, { status: 400 });
    }

    // Check vote limits by plan
    const today = new Date().toISOString().slice(0, 10);
    const { count: votesToday } = await supabaseAdmin
      .from("battle_votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", `${today}T00:00:00Z`);

    const limits: Record<string, number> = { free: 5, plus: 20, pro: 999, family: 999 };
    const limit = limits[profile.plan] || 5;

    if ((votesToday || 0) >= limit) {
      return NextResponse.json({ error: "Vote limit reached" }, { status: 429 });
    }

    // Insert vote
    const { error: voteError } = await supabaseAdmin.from("battle_votes").insert({
      match_id: matchId,
      user_id: profile.id,
      voted_pet_id: petId,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        return NextResponse.json({ error: "Already voted on this match" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
    }

    // Update match vote count
    const { data: match } = await supabaseAdmin
      .from("battle_matches")
      .select("pet1_id")
      .eq("id", matchId)
      .single();

    const field = match?.pet1_id === petId ? "pet1_votes" : "pet2_votes";
    await supabaseAdmin.rpc("increment_battle_vote", {
      match_id_input: matchId,
      field_name: field,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[battle/vote] Error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
