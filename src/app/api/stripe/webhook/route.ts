import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, DONATION_PER_MONTH } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Verify webhook signature (skip in dev if no secret)
  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && webhookSecret !== "whsec_xxxxx" && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe/webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Dev mode — parse without verification
    event = JSON.parse(body) as Stripe.Event;
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
          // EC one-time payment — handled in P2-012
          console.log(`[stripe/webhook] EC payment completed: ${session.id}`);
        }
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
