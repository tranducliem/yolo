import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Tag } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");

  let query = supabaseAdmin
    .from("tags")
    .select("id, name, type, emoji, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (type === "normal" || type === "donation") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ tags: [] }, { status: 200 });
  }

  const tags: Tag[] = (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    emoji: t.emoji,
    sortOrder: t.sort_order,
  }));

  return NextResponse.json(
    { tags },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  );
}
