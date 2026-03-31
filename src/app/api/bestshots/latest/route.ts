import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single();

  if (!profile) {
    return NextResponse.json({ bestshot: null });
  }

  const { data: pet } = await supabaseAdmin
    .from("pets")
    .select("id, name")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!pet) {
    return NextResponse.json({ bestshot: null });
  }

  const { data: bestshot } = await supabaseAdmin
    .from("bestshots")
    .select(
      "id, photo_url, total_score, quality_score, expression_score, preference_score, ai_comment, created_at",
    )
    .eq("pet_id", pet.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!bestshot) {
    return NextResponse.json({ bestshot: null });
  }

  return NextResponse.json({
    bestshot: {
      id: bestshot.id,
      photoUrl: bestshot.photo_url,
      totalScore: bestshot.total_score,
      qualityScore: bestshot.quality_score,
      expressionScore: bestshot.expression_score,
      preferenceScore: bestshot.preference_score,
      aiComment: bestshot.ai_comment,
      createdAt: bestshot.created_at,
      petName: pet.name,
    },
  });
}
