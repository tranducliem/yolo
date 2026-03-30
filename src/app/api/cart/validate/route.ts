import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface CartItemInput {
  id: string;
  goodsId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { items } = (await request.json()) as { items: CartItemInput[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
      }
    }

    // Fetch current product data for all items
    const productIds = items.map((item) => item.goodsId);
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_active, donation_percent")
      .in("id", productIds);

    const productMap = new Map((products || []).map((p) => [p.id, p]));

    const validItems: CartItemInput[] = [];
    const invalidItems: string[] = [];
    const priceUpdates: { id: string; oldPrice: number; newPrice: number }[] = [];

    for (const item of items) {
      const product = productMap.get(item.goodsId);

      if (!product || !product.is_active) {
        invalidItems.push(item.goodsId);
        continue;
      }

      // Check price mismatch
      if (item.price !== product.price) {
        priceUpdates.push({
          id: item.goodsId,
          oldPrice: item.price,
          newPrice: product.price,
        });
      }

      validItems.push({
        ...item,
        price: product.price, // Always use current DB price
        name: product.name,
      });
    }

    const subtotal = validItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 5000 ? 0 : 500;
    const donationAmount = Math.ceil(subtotal * 0.05);
    const total = subtotal + shippingFee;

    return NextResponse.json({
      validItems,
      invalidItems,
      priceUpdates,
      subtotal,
      shippingFee,
      donationAmount,
      total,
    });
  } catch (error) {
    console.error("[cart/validate] Error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
