import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, AdminError } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();
    const { data: npos } = await supabaseAdmin
      .from("npos")
      .select("*")
      .order("allocation_ratio", { ascending: false });
    return NextResponse.json({ npos: npos || [] });
  } catch (error) {
    if (error instanceof AdminError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to get NPOs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { name, region, target, allocationRatio } = await request.json();

    if (!name || !region || !target) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: npo, error } = await supabaseAdmin
      .from("npos")
      .insert({ name, region, target, allocation_ratio: allocationRatio || 0 })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: "Failed to create NPO" }, { status: 500 });
    return NextResponse.json({ npo });
  } catch (error) {
    if (error instanceof AdminError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to create NPO" }, { status: 500 });
  }
}
