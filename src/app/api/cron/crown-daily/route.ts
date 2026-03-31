import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Idempotency check
    const { data: existing } = await supabaseAdmin
      .from("crown_history")
      .select("id")
      .eq("date", today)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already selected for today" });
    }

    // Find the pet with highest engagement from yesterday's posts
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const { data: topPost } = await supabaseAdmin
      .from("posts")
      .select("pet_id, likes_count, comments_count")
      .not("pet_id", "is", null)
      .eq("visibility", "public")
      .gte("created_at", `${yesterday}T00:00:00Z`)
      .lt("created_at", `${today}T00:00:00Z`)
      .order("likes_count", { ascending: false })
      .limit(1)
      .single();

    if (!topPost?.pet_id) {
      return NextResponse.json({ success: true, message: "No eligible posts found" });
    }

    // Create crown entry
    const score = topPost.likes_count + topPost.comments_count * 2;
    await supabaseAdmin.from("crown_history").insert({
      pet_id: topPost.pet_id,
      date: today,
      vote_count: score,
      likes: topPost.likes_count,
    });

    // Award 100 Paw Points to pet owner
    const { data: pet } = await supabaseAdmin
      .from("pets")
      .select("user_id")
      .eq("id", topPost.pet_id)
      .single();

    if (pet) {
      await supabaseAdmin.rpc("increment_user_paw_points", {
        user_id_input: pet.user_id,
        amount_input: 100,
      });

      // Notify pet owner
      await supabaseAdmin.from("notifications").insert({
        user_id: pet.user_id,
        type: "crown",
        title: "👑 今日のCrown!",
        body: "あなたのペットが今日のCrownに選ばれました！+100🐾",
        icon: "👑",
        link: "/ranking",
      });
    }

    return NextResponse.json({ success: true, petId: topPost.pet_id, score });
  } catch (error) {
    console.error("[cron/crown-daily] Error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
