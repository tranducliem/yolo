import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    let query = supabaseAdmin
      .from("comments")
      .select(
        `
        id, user_id, post_id, parent_id, content, created_at,
        users!inner(display_name, avatar_url)
      `,
      )
      .eq("post_id", postId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (cursor) {
      query = query.gt("created_at", cursor);
    }

    const { data: comments } = await query;

    const formatted = (comments || []).map((c) => {
      const user = c.users as unknown as { display_name: string; avatar_url: string };
      return {
        id: c.id,
        userId: c.user_id,
        postId: c.post_id,
        parentId: c.parent_id,
        content: c.content,
        createdAt: c.created_at,
        userName: user?.display_name || "ユーザー",
        userAvatarUrl: user?.avatar_url || null,
      };
    });

    const lastComment = formatted[formatted.length - 1];
    const nextCursor = formatted.length === limit ? lastComment?.createdAt : null;

    return NextResponse.json({ comments: formatted, nextCursor });
  } catch (error) {
    console.error("[posts/comments] GET Error:", error);
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 });
  }
}

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
      .select("id, display_name, avatar_url")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { content, parentId } = await request.json();

    // Sanitize
    const sanitized = (content || "").replace(/<[^>]*>/g, "").trim();
    if (!sanitized || sanitized.length > 500) {
      return NextResponse.json({ error: "Comment must be 1-500 characters" }, { status: 400 });
    }

    const { data: comment, error } = await supabaseAdmin
      .from("comments")
      .insert({
        user_id: profile.id,
        post_id: postId,
        parent_id: parentId || null,
        content: sanitized,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("[posts/comments] Insert error:", error);
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        userId: profile.id,
        postId,
        parentId: parentId || null,
        content: sanitized,
        createdAt: comment.created_at,
        userName: profile.display_name,
        userAvatarUrl: profile.avatar_url,
      },
    });
  } catch (error) {
    console.error("[posts/comments] POST Error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
