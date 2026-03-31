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

  // Get user profile (paw_points, ambassador_level live on users table)
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("id, paw_points, ambassador_level")
    .eq("auth_id", authUser.id)
    .single();

  if (!profile) {
    return NextResponse.json({ pet: null });
  }

  // Get user's primary pet (oldest created)
  const { data: pet } = await supabaseAdmin
    .from("pets")
    .select("id, name, type, breed, birthday, avatar_url, is_public")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!pet) {
    return NextResponse.json({ pet: null });
  }

  // Get pet photos from bestshots table
  const { data: photos } = await supabaseAdmin
    .from("bestshots")
    .select("id, photo_url, total_score, ai_comment, created_at")
    .eq("pet_id", pet.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Count posts
  const { count: postsCount } = await supabaseAdmin
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("pet_id", pet.id);

  // Count total likes received on user's posts
  const { data: likesData } = await supabaseAdmin
    .from("posts")
    .select("likes_count")
    .eq("pet_id", pet.id);
  const likesReceived = (likesData ?? []).reduce((sum, p) => sum + (p.likes_count || 0), 0);

  // Count followers/following for the owner
  const { count: followersCount } = await supabaseAdmin
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("following_id", profile.id);

  const { count: followingCount } = await supabaseAdmin
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  // Count battle wins
  const { count: battleWins } = await supabaseAdmin
    .from("battle_matches")
    .select("id", { count: "exact", head: true })
    .eq("winner_pet_id", pet.id);

  // Count crown wins
  const { count: crownCount } = await supabaseAdmin
    .from("crown_history")
    .select("id", { count: "exact", head: true })
    .eq("pet_id", pet.id);

  return NextResponse.json({
    pet: {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      birthday: pet.birthday,
      avatarUrl: pet.avatar_url,
      isPublic: pet.is_public,
      photos: (photos ?? []).map((p) => ({
        id: p.id,
        photoUrl: p.photo_url,
        totalScore: p.total_score,
        aiComment: p.ai_comment,
        createdAt: p.created_at,
      })),
      stats: {
        postsCount: postsCount ?? 0,
        likesReceived,
        followersCount: followersCount ?? 0,
        followingCount: followingCount ?? 0,
        battleWins: battleWins ?? 0,
        crownCount: crownCount ?? 0,
      },
      pawPoints: profile.paw_points ?? 0,
      ambassadorLevel: profile.ambassador_level ?? 0,
    },
  });
}
