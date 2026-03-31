import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  // Get donation tags with aggregated stats from posts
  const { data: tags } = await supabaseAdmin
    .from("tags")
    .select("id, name, type, emoji, sort_order")
    .eq("type", "donation")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // For each tag, get post count and donation total
  const tagsWithStats = await Promise.all(
    (tags ?? []).map(async (tag) => {
      const { count: postCount } = await supabaseAdmin
        .from("posts")
        .select("id", { count: "exact", head: true })
        .contains("tags", [tag.name]);

      const { data: donations } = await supabaseAdmin
        .from("donations")
        .select("amount")
        .eq("source", "membership");

      const donationTotal = (donations ?? []).reduce((sum, d) => sum + (d.amount || 0), 0);

      return {
        id: tag.id,
        tag: tag.name,
        label: tag.name,
        posts: postCount ?? 0,
        donationTotal: Math.round(donationTotal / Math.max((tags ?? []).length, 1)),
        isActive: true,
      };
    }),
  );

  return NextResponse.json({ tags: tagsWithStats });
}
