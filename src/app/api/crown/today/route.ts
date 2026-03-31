import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: crown } = await supabaseAdmin
      .from("crown_history")
      .select("*, pets!inner(name, avatar_url, type, breed, users!inner(display_name, avatar_url))")
      .eq("date", today)
      .single();

    if (!crown) {
      return NextResponse.json({ crown: null });
    }

    const pet = crown.pets as unknown as {
      name: string;
      avatar_url: string;
      type: string;
      breed: string;
      users: { display_name: string; avatar_url: string };
    };

    return NextResponse.json({
      crown: {
        id: crown.id,
        date: crown.date,
        petId: crown.pet_id,
        petName: pet.name,
        petAvatarUrl: pet.avatar_url,
        petType: pet.type,
        petBreed: pet.breed,
        ownerName: pet.users.display_name,
        voteCount: crown.vote_count,
        views: crown.views,
        likes: crown.likes,
        shares: crown.shares,
        mode: crown.mode,
      },
    });
  } catch (error) {
    console.error("[crown/today] Error:", error);
    return NextResponse.json({ error: "Failed to get crown" }, { status: 500 });
  }
}
