import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ fcm_token: token })
    .eq("auth_id", authUser.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save token" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
