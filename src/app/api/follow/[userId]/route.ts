import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId: targetUserId } = await params;
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

    if (profile.id === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check existing follow
    const { data: existing } = await supabaseAdmin
      .from("follows")
      .select("id")
      .eq("follower_id", profile.id)
      .eq("following_id", targetUserId)
      .single();

    if (existing) {
      await supabaseAdmin.from("follows").delete().eq("id", existing.id);
      return NextResponse.json({ following: false });
    } else {
      await supabaseAdmin.from("follows").insert({
        follower_id: profile.id,
        following_id: targetUserId,
      });
      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("[follow] Error:", error);
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}
