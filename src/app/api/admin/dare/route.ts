import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin.from("dares").select("*").order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);

    const { data: dares } = await query;

    return NextResponse.json({ dares: dares || [] });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/dare] Error:", error);
    return NextResponse.json({ error: "Failed to get dares" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { theme, hashtag, description, startDate, endDate, rewards, isDonationChallenge } = body;

    if (!theme || !hashtag || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: dare, error } = await supabaseAdmin
      .from("dares")
      .insert({
        theme,
        hashtag,
        description: description || "",
        start_date: startDate,
        end_date: endDate,
        status: "draft",
        rewards: rewards || { first: 100, second: 50, third: 30, participation: 5 },
        is_donation_challenge: isDonationChallenge || false,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create dare" }, { status: 500 });
    }

    return NextResponse.json({ dare });
  } catch (error) {
    if (error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[admin/dare] Error:", error);
    return NextResponse.json({ error: "Failed to create dare" }, { status: 500 });
  }
}
