import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
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

    await supabaseAdmin
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("user_id", profile.id)
      .eq("read", false);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notifications/read-all] Error:", error);
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 });
  }
}
