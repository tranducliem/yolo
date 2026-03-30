import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabaseAdmin.from("products").select("*").eq("is_active", true).order("sort_order");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[products] Error:", error);
    return NextResponse.json({ error: "Failed to get products" }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
