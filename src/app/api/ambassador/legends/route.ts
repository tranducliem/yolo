import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: topDonors } = await supabaseAdmin
    .from("users")
    .select("id, display_name, donation_total, ambassador_level")
    .gte("ambassador_level", 4)
    .order("donation_total", { ascending: false })
    .limit(10);

  const legends = await Promise.all(
    (topDonors ?? []).map(async (u) => {
      const { data: pet } = await supabaseAdmin
        .from("pets")
        .select("name, avatar_url")
        .eq("user_id", u.id)
        .limit(1)
        .single();

      return {
        name: u.display_name,
        petName: pet?.name ?? "",
        imageUrl: pet?.avatar_url ?? "",
        totalDonation: u.donation_total ?? 0,
        badge: u.ambassador_level >= 5 ? "🏆" : "💎",
      };
    }),
  );

  return NextResponse.json({ legends });
}
