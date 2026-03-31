import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, DONATION_PER_MONTH } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Verify webhook signature — always required
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[stripe/webhook] Event: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe/webhook] Payment failed for customer: ${invoice.customer}`);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          await handleECPaymentCompleted(session);
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
      default:
        console.log(`[stripe/webhook] Unhandled event: ${event.type}`);
    }
  } catch (error) {
    console.error("[stripe/webhook] Processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  const userId = sub.metadata?.user_id;

  if (!userId) {
    // Find user by Stripe customer ID
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();
    if (!existingSub) {
      console.error("[stripe/webhook] No user found for customer:", customerId);
      return;
    }
  }

  // Determine plan from price
  const priceId = sub.items.data[0]?.price?.id;
  const plan = determinePlan(priceId || "");
  const billingCycle =
    sub.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
  const donationPerMonth = DONATION_PER_MONTH[plan] || 0;

  const targetUserId =
    userId ||
    (
      await supabaseAdmin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single()
    ).data?.user_id;

  if (!targetUserId) return;

  // Upsert subscription
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: targetUserId,
      plan,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      billing_cycle: billingCycle,
      current_period_start: sub.items.data[0]?.current_period_start
        ? new Date(sub.items.data[0].current_period_start * 1000).toISOString()
        : null,
      current_period_end: sub.items.data[0]?.current_period_end
        ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end,
      donation_per_month: donationPerMonth,
    },
    { onConflict: "user_id" },
  );

  // Update user plan
  await supabaseAdmin.from("users").update({ plan }).eq("id", targetUserId);

  console.log(`[stripe/webhook] Subscription ${sub.status}: user=${targetUserId}, plan=${plan}`);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;

  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!existingSub) return;

  // Reset to free plan
  await supabaseAdmin
    .from("subscriptions")
    .update({ plan: "free", cancel_at_period_end: false, donation_per_month: 0 })
    .eq("user_id", existingSub.user_id);

  await supabaseAdmin.from("users").update({ plan: "free" }).eq("id", existingSub.user_id);

  console.log(`[stripe/webhook] Subscription deleted: user=${existingSub.user_id} → free`);
}

async function handleECPaymentCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.log("[stripe/webhook] EC payment: no order_id in metadata");
    return;
  }

  // Idempotency: check if already processed
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status, donation_amount, subtotal")
    .eq("id", orderId)
    .single();

  if (!order) {
    console.error("[stripe/webhook] Order not found:", orderId);
    return;
  }

  if (order.status !== "pending") {
    console.log(`[stripe/webhook] Order ${orderId} already processed (status: ${order.status})`);
    return;
  }

  // Update order status
  await supabaseAdmin
    .from("orders")
    .update({
      status: "processing",
      stripe_payment_id: session.payment_intent as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  // Create goods donation
  if (order.donation_amount > 0) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await supabaseAdmin.from("donations").insert({
      user_id: order.user_id,
      source: "goods",
      amount: order.donation_amount,
      order_id: orderId,
      month,
      executed: false,
    });

    // Update user donation total
    await supabaseAdmin.rpc("increment_user_donation", {
      user_id_input: order.user_id,
      amount_input: order.donation_amount,
    });
  }

  // Award Paw Points (1 point per ¥100 spent)
  const pawPoints = Math.floor(order.subtotal / 100);
  if (pawPoints > 0) {
    await supabaseAdmin.rpc("increment_user_paw_points", {
      user_id_input: order.user_id,
      amount_input: pawPoints,
    });
  }

  console.log(
    `[stripe/webhook] EC order ${orderId} → processing, donation=¥${order.donation_amount}, paw_points=+${pawPoints}`,
  );
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, donation_amount, subtotal")
    .eq("stripe_payment_id", paymentIntentId)
    .single();

  if (!order) {
    console.log("[stripe/webhook] Refund: no order found for payment:", paymentIntentId);
    return;
  }

  // Update order status
  await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", order.id);

  // Reverse Paw Points
  const pawPoints = Math.floor(order.subtotal / 100);
  if (pawPoints > 0) {
    await supabaseAdmin.rpc("increment_user_paw_points", {
      user_id_input: order.user_id,
      amount_input: -pawPoints,
    });
  }

  console.log(`[stripe/webhook] Order ${order.id} refunded → cancelled`);
}

function determinePlan(priceId: string): string {
  if (
    priceId.includes("plus") ||
    priceId === "price_1TGhywGflqg5ErCq9bAve93w" ||
    priceId === "price_1TGhywGflqg5ErCq6yoJ7UyC"
  )
    return "plus";
  if (
    priceId.includes("pro") ||
    priceId === "price_1TGhyxGflqg5ErCqB1u4tpfH" ||
    priceId === "price_1TGhyxGflqg5ErCqfwUmzS0d"
  )
    return "pro";
  if (
    priceId.includes("family") ||
    priceId === "price_1TGhyyGflqg5ErCqboBSPnRC" ||
    priceId === "price_1TGhyyGflqg5ErCq2IZ6kKoy"
  )
    return "family";
  return "free";
}
