import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const VALID_EMOTIONS = ["happy", "funny", "touched", "crying"];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { type } = await request.json();
    if (!VALID_EMOTIONS.includes(type)) {
      return NextResponse.json({ error: "Invalid emotion type" }, { status: 400 });
    }

    // Toggle emotion
    const { data: existing } = await supabaseAdmin
      .from("emotions")
      .select("id")
      .eq("user_id", profile.id)
      .eq("post_id", postId)
      .eq("emotion_type", type)
      .single();

    if (existing) {
      await supabaseAdmin.from("emotions").delete().eq("id", existing.id);
    } else {
      await supabaseAdmin.from("emotions").insert({
        user_id: profile.id,
        post_id: postId,
        emotion_type: type,
      });
    }

    // Get updated emotions
    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("emotions")
      .eq("id", postId)
      .single();

    return NextResponse.json({
      active: !existing,
      emotions: post?.emotions || { happy: 0, funny: 0, touched: 0, crying: 0 },
    });
  } catch (error) {
    console.error("[posts/emotion] Error:", error);
    return NextResponse.json({ error: "Failed to toggle emotion" }, { status: 500 });
  }
}
