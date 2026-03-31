import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  // Get users with ambassador level >= 3 (regional ambassadors)
  const { data: ambassadors } = await supabaseAdmin
    .from("users")
    .select(
      "id, display_name, ambassador_level, ambassador_region, ambassador_category, donation_total",
    )
    .gte("ambassador_level", 3)
    .not("ambassador_region", "is", null);

  // Get their pets
  const prefectures: Record<
    string,
    { prefecture: string; region: string; dog?: unknown; cat?: unknown }
  > = {};

  for (const amb of ambassadors ?? []) {
    if (!amb.ambassador_region) continue;
    const { data: pet } = await supabaseAdmin
      .from("pets")
      .select("name, type, avatar_url")
      .eq("user_id", amb.id)
      .limit(1)
      .single();

    if (!prefectures[amb.ambassador_region]) {
      prefectures[amb.ambassador_region] = {
        prefecture: amb.ambassador_region,
        region: amb.ambassador_region,
      };
    }

    const entry = {
      name: amb.display_name,
      petName: pet?.name ?? "",
      imageUrl: pet?.avatar_url ?? "",
      donationTotal: amb.donation_total ?? 0,
      postCount: 0,
    };

    const category = amb.ambassador_category ?? pet?.type ?? "dog";
    if (category === "cat") {
      prefectures[amb.ambassador_region].cat = entry;
    } else {
      prefectures[amb.ambassador_region].dog = entry;
    }
  }

  return NextResponse.json({ prefectures: Object.values(prefectures) });
}
