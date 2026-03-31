import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const petId = searchParams.get("petId");
  const latest = searchParams.get("latest") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 50);

  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  let query = supabaseAdmin
    .from("bestshots")
    .select(
      "id, photo_url, total_score, quality_score, expression_score, preference_score, ai_comment, rank, created_at",
    )
    .eq("pet_id", petId)
    .order("created_at", { ascending: false });

  if (latest) {
    query = query.limit(1);
  } else {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ bestshots: [] });
  }

  const bestshots = (data ?? []).map((b) => ({
    id: b.id,
    photoUrl: b.photo_url,
    totalScore: b.total_score,
    qualityScore: b.quality_score,
    expressionScore: b.expression_score,
    preferenceScore: b.preference_score,
    aiComment: b.ai_comment,
    rank: b.rank,
    createdAt: b.created_at,
  }));

  return NextResponse.json({ bestshots });
}
