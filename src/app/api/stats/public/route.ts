import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const [usersRes, petsRes, postsRes, bestshotsRes, donationsRes, nposRes] = await Promise.all([
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("pets").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("bestshots").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("donations").select("amount").eq("status", "executed"),
    supabaseAdmin.from("npos").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const totalDonations = (donationsRes.data ?? []).reduce((sum, d) => sum + (d.amount || 0), 0);

  return NextResponse.json(
    {
      stats: {
        users: usersRes.count ?? 0,
        pets: petsRes.count ?? 0,
        posts: postsRes.count ?? 0,
        bestshots: bestshotsRes.count ?? 0,
        totalDonations,
        animalsHelped: Math.floor(totalDonations / 100),
        npos: nposRes.count ?? 0,
      },
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
