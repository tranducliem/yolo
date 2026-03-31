import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdmin();

    // sponsors table may not exist yet
    const { data: sponsors, error } = await supabaseAdmin
      .from("sponsors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ sponsors: [] });
    }

    return NextResponse.json({ sponsors: sponsors ?? [] });
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: (err as { status: number }).status },
      );
    }
    return NextResponse.json({ sponsors: [] });
  }
}
