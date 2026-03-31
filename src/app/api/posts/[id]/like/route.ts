import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    // Check if already liked
    const { data: existing } = await supabaseAdmin
      .from("likes")
      .select("id")
      .eq("user_id", profile.id)
      .eq("post_id", postId)
      .single();

    if (existing) {
      // Unlike
      await supabaseAdmin.from("likes").delete().eq("id", existing.id);
      const { data: post } = await supabaseAdmin
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();
      return NextResponse.json({ liked: false, newCount: post?.likes_count || 0 });
    } else {
      // Like
      await supabaseAdmin.from("likes").insert({ user_id: profile.id, post_id: postId });
      const { data: post } = await supabaseAdmin
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();
      return NextResponse.json({ liked: true, newCount: post?.likes_count || 0 });
    }
  } catch (error) {
    console.error("[posts/like] Error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
