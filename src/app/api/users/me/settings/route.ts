import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("id, settings")
    .eq("auth_id", authUser.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const currentSettings = (profile.settings as Record<string, unknown>) ?? {};
  const newSettings = { ...currentSettings, ...body };

  const { error } = await supabaseAdmin
    .from("users")
    .update({ settings: newSettings })
    .eq("id", profile.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }

  return NextResponse.json({ settings: newSettings });
}
