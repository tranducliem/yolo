import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
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

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Fetch all order items for these orders
    const orderIds = orders.map((o) => o.id);
    const { data: allItems } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems || []) {
      const existing = itemsByOrder.get(item.order_id) || [];
      existing.push(item);
      itemsByOrder.set(item.order_id, existing);
    }

    const result = orders.map((o) => ({
      ...o,
      items: (itemsByOrder.get(o.id) || []).map((i) => ({
        name: i.product_name,
        price: i.unit_price,
        quantity: i.quantity,
        imageUrl: i.photo_url || "",
      })),
    }));

    return NextResponse.json({ orders: result });
  } catch (error) {
    console.error("[orders] Error:", error);
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 });
  }
}
