import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    return NextResponse.json({
      order: {
        ...order,
        items: (items || []).map((i) => ({
          name: i.product_name,
          price: i.unit_price,
          quantity: i.quantity,
          imageUrl: i.photo_url || "",
        })),
      },
    });
  } catch (error) {
    console.error("[orders/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to get order" }, { status: 500 });
  }
}
