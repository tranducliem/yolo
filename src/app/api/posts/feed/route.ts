import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "recommend";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const search = searchParams.get("search");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("posts")
      .select(
        `
        id, user_id, pet_id, photo_url, caption, tags, visibility,
        is_donation_tagged, is_boosted, likes_count, comments_count,
        shares_count, emotions, created_at,
        users!inner(display_name, avatar_url, ambassador_level),
        pets(name)
      `,
      )
      .eq("visibility", "public")
      .limit(limit);

    // Category filters
    switch (category) {
      case "donation":
        query = query.eq("is_donation_tagged", true);
        break;
      case "dog":
      case "cat":
        // Filter by pet type - requires pets table join
        query = query.not("pet_id", "is", null);
        break;
      case "funny":
      case "sleeping":
      case "walk":
      case "snack":
        query = query.contains("tags", [`#${category}`]);
        break;
    }

    // Search
    if (search) {
      query = query.or(`caption.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Pagination
    if (category === "recommend") {
      // Offset-based for recommend (complex sort)
      query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    } else if (cursor) {
      query = query.lt("created_at", cursor).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("[posts/feed] Error:", error);
      return NextResponse.json({ error: "Failed to get feed" }, { status: 500 });
    }

    const formattedPosts = (posts || []).map((p) => {
      const user = p.users as unknown as {
        display_name: string;
        avatar_url: string;
        ambassador_level: number;
      };
      const pet = p.pets as unknown as { name: string } | null;
      return {
        id: p.id,
        userId: p.user_id,
        petId: p.pet_id,
        photoUrl: p.photo_url,
        caption: p.caption,
        tags: p.tags,
        visibility: p.visibility,
        isDonationTagged: p.is_donation_tagged,
        isBoosted: p.is_boosted,
        likesCount: p.likes_count,
        commentsCount: p.comments_count,
        sharesCount: p.shares_count,
        emotions: p.emotions,
        createdAt: p.created_at,
        petName: pet?.name || null,
        ownerName: user?.display_name || "ユーザー",
        ownerAvatarUrl: user?.avatar_url || null,
        ambassadorLevel: user?.ambassador_level || 0,
      };
    });

    const lastPost = formattedPosts[formattedPosts.length - 1];
    const nextCursor = formattedPosts.length === limit ? lastPost?.createdAt : null;

    return NextResponse.json({
      posts: formattedPosts,
      nextCursor,
    });
  } catch (error) {
    console.error("[posts/feed] Error:", error);
    return NextResponse.json({ error: "Failed to get feed" }, { status: 500 });
  }
}
