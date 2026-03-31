import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "total";
    const _period = searchParams.get("period") || "alltime"; // reserved for future period filtering
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    let orderBy: string;
    switch (category) {
      case "likes":
        orderBy = "total_likes";
        break;
      case "posts":
        orderBy = "post_count";
        break;
      case "followers":
        orderBy = "follower_count";
        break;
      case "donation":
        orderBy = "donation_total";
        break;
      default:
        orderBy = "composite_score";
    }

    const { data: rankings, error } = await supabaseAdmin
      .from("pet_stats")
      .select("*")
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) {
      // Materialized view might need refresh
      console.error("[ranking] Error:", error);
      return NextResponse.json({ rankings: [] });
    }

    return NextResponse.json({
      rankings: (rankings || []).map((r, i) => ({
        rank: i + 1,
        petId: r.pet_id,
        petName: r.pet_name,
        avatarUrl: r.avatar_url,
        petType: r.pet_type,
        ownerName: r.owner_name,
        ambassadorLevel: r.ambassador_level,
        postCount: r.post_count,
        totalLikes: r.total_likes,
        followerCount: r.follower_count,
        donationTotal: r.donation_total,
        compositeScore: r.composite_score,
      })),
    });
  } catch (error) {
    console.error("[ranking] Error:", error);
    return NextResponse.json({ error: "Failed to get rankings" }, { status: 500 });
  }
}
