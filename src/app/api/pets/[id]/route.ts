import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get pet with owner
    const { data: pet } = await supabaseAdmin
      .from("pets")
      .select("*, users!inner(id, display_name, avatar_url, ambassador_level)")
      .eq("id", id)
      .single();

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    const owner = pet.users as unknown as {
      id: string;
      display_name: string;
      avatar_url: string;
      ambassador_level: number;
    };

    // Count posts
    const { count: postCount } = await supabaseAdmin
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("pet_id", id);

    // Count followers/following for the owner
    const { count: followerCount } = await supabaseAdmin
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", owner.id);

    const { count: followingCount } = await supabaseAdmin
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", owner.id);

    // Recent posts
    const { data: recentPosts } = await supabaseAdmin
      .from("posts")
      .select("id, photo_url, likes_count, comments_count, created_at")
      .eq("pet_id", id)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(12);

    // Crown/badge counts
    const { count: crownCount } = await supabaseAdmin
      .from("crown_history")
      .select("id", { count: "exact", head: true })
      .eq("pet_id", id);

    return NextResponse.json({
      pet: {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        avatarUrl: pet.avatar_url,
        birthday: pet.birthday,
        owner: {
          id: owner.id,
          displayName: owner.display_name,
          avatarUrl: owner.avatar_url,
          ambassadorLevel: owner.ambassador_level,
        },
        stats: {
          postCount: postCount || 0,
          followerCount: followerCount || 0,
          followingCount: followingCount || 0,
        },
        recentPosts: (recentPosts || []).map((p) => ({
          id: p.id,
          photoUrl: p.photo_url,
          likesCount: p.likes_count,
          commentsCount: p.comments_count,
        })),
        badges: {
          crownCount: crownCount || 0,
        },
      },
    });
  } catch (error) {
    console.error("[pets/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to get pet" }, { status: 500 });
  }
}
