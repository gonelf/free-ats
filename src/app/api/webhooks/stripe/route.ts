import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { MONTHLY_CREDITS } from "@/lib/ai/credits";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const orgId = session.metadata?.organizationId;
        if (!orgId) break;

        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);
        await db.organization.update({
          where: { id: orgId },
          data: {
            plan: "PRO",
            stripeSubscriptionId: session.subscription as string,
            aiCreditsBalance: MONTHLY_CREDITS,
            aiCreditsResetAt: nextReset,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const org = await db.organization.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (!org) break;

        const isActive = subscription.status === "active";
        await db.organization.update({
          where: { id: org.id },
          data: {
            plan: isActive ? "PRO" : "FREE",
            stripeSubscriptionId: isActive ? subscription.id : null,
            // On downgrade, clear Pro credits and reset date (no more monthly top-ups)
            ...(isActive ? {} : { aiCreditsBalance: 0, aiCreditsResetAt: null }),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const org = await db.organization.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (!org) break;

        await db.organization.update({
          where: { id: org.id },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
