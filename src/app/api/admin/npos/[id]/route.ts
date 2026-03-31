import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const allowed = ["name", "region", "target", "allocation_ratio", "is_active"];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, value] of Object.entries(body)) {
      if (allowed.includes(key)) updates[key] = value;
    }

    await supabaseAdmin.from("npos").update(updates).eq("id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to update NPO" }, { status: 500 });
  }
}
