import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { petId, photoUrl, caption, tags, visibility, isDonationTagged } = body;

    // Validate required fields
    if (!photoUrl) {
      return NextResponse.json({ error: "Photo URL is required" }, { status: 400 });
    }

    // Sanitize caption
    const sanitizedCaption = (caption || "").replace(/<[^>]*>/g, "").trim();
    if (sanitizedCaption.length > 200) {
      return NextResponse.json({ error: "Caption too long (max 200 chars)" }, { status: 400 });
    }

    // Sanitize tags
    const sanitizedTags = (tags || []).filter(
      (t: string) => typeof t === "string" && /^[\w\u3000-\u9FFF#]+$/.test(t),
    );

    // Validate visibility
    const validVisibility = ["public", "followers", "private"].includes(visibility)
      ? visibility
      : "public";

    // Create post
    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id: profile.id,
        pet_id: petId || null,
        photo_url: photoUrl,
        caption: sanitizedCaption,
        tags: sanitizedTags,
        visibility: validVisibility,
        is_donation_tagged: isDonationTagged || false,
      })
      .select("id, created_at")
      .single();

    if (postError) {
      console.error("[posts/create] Insert error:", postError);
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    // Award Paw Points (+10 for post, +20 if donation tagged)
    const pawPoints = isDonationTagged ? 20 : 10;
    await supabaseAdmin.rpc("increment_user_paw_points", {
      user_id_input: profile.id,
      amount_input: pawPoints,
    });

    return NextResponse.json({
      post: { id: post.id, createdAt: post.created_at },
      pawPointsEarned: pawPoints,
    });
  } catch (error) {
    console.error("[posts/create] Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
