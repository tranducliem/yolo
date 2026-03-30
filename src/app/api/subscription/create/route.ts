import { NextRequest, NextResponse } from "next/server";
import { stripe, getPriceId } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, billingCycle } = await request.json();

    if (!["plus", "pro", "family"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("auth_id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create Stripe customer
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", profile.id)
      .single();

    let customerId = sub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { user_id: profile.id },
      });
      customerId = customer.id;
    }

    // Create Stripe Checkout Session
    const priceId = getPriceId(plan, billingCycle);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription?cancelled=true`,
      metadata: { user_id: profile.id, plan, billing_cycle: billingCycle },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("[subscription/create] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
