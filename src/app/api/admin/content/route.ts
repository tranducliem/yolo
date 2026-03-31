import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Get recent posts for moderation
    const { data: posts } = await supabaseAdmin
      .from("posts")
      .select(
        "id, user_id, photo_url, caption, tags, visibility, likes_count, comments_count, created_at, users!inner(display_name, email)",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    if (error instanceof AdminError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to get content" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { postId } = await request.json();

    if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

    await supabaseAdmin.from("posts").delete().eq("id", postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
