import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface CartItemInput {
  goodsId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

export const maxDuration = 30;

export async function POST(request: NextRequest) {
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
      .select("id, email")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { items, shipping } = (await request.json()) as {
      items: CartItemInput[];
      shipping: { name: string; zip: string; address: string; phone: string };
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
      }
    }
    if (!shipping?.name || !shipping?.address) {
      return NextResponse.json({ error: "Shipping info required" }, { status: 400 });
    }

    // Validate items against DB
    const productIds = items.map((i) => i.goodsId);
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_active, donation_percent")
      .in("id", productIds);

    const productMap = new Map((products || []).map((p) => [p.id, p]));

    // Build validated order items
    const orderItems: {
      product_id: string;
      product_name: string;
      price: number;
      quantity: number;
      variant: string | null;
    }[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.goodsId);
      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: `Product ${item.name} is no longer available` },
          { status: 400 },
        );
      }
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: item.quantity,
        variant: item.variant || null,
      });
      subtotal += product.price * item.quantity;
    }

    const shippingFee = subtotal >= 5000 ? 0 : 500;
    const donationAmount = Math.ceil(subtotal * 0.05);
    const total = subtotal + shippingFee;

    // Generate order number: YOLO-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `YOLO-${dateStr}-${rand}`;

    // Create order in DB
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: profile.id,
        order_number: orderNumber,
        status: "pending",
        subtotal,
        shipping_fee: shippingFee,
        donation_amount: donationAmount,
        points_used: 0,
        total,
        shipping_name: shipping.name,
        shipping_zip: shipping.zip || null,
        shipping_address: shipping.address,
        shipping_phone: shipping.phone || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[orders/create] Order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Insert order items
    const itemRows = orderItems.map((oi) => ({
      order_id: order.id,
      product_id: oi.product_id,
      product_name: oi.product_name,
      product_type: "goods",
      unit_price: oi.price,
      quantity: oi.quantity,
      options: oi.variant ? { variant: oi.variant } : null,
    }));

    await supabaseAdmin.from("order_items").insert(itemRows);

    // Create Stripe Checkout Session
    const lineItems = orderItems.map((oi) => ({
      price_data: {
        currency: "jpy",
        product_data: { name: oi.product_name },
        unit_amount: oi.price,
      },
      quantity: oi.quantity,
    }));

    // Add shipping as a line item if applicable
    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "jpy",
          product_data: { name: "送料" },
          unit_amount: shippingFee,
        },
        quantity: 1,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${appUrl}/order-complete?orderId=${order.id}`,
      cancel_url: `${appUrl}/cart`,
      customer_email: profile.email,
      metadata: { order_id: order.id, user_id: profile.id },
    });

    // Store stripe session id on order
    await supabaseAdmin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return NextResponse.json({
      orderId: order.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error("[orders/create] Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
