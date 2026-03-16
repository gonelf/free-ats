import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { MONTHLY_CREDITS } from "@/lib/ai/credits";

/**
 * POST /api/stripe/sync-subscription
 *
 * Fetches the org's active Stripe subscription and syncs the plan to the DB.
 * Called from the billing page after a successful checkout redirect, as a
 * fallback for when the Stripe webhook hasn't fired yet (e.g. local dev).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });
  if (!member) return NextResponse.json({ error: "No organization" }, { status: 403 });

  const org = member.organization;

  if (!org.stripeCustomerId) {
    return NextResponse.json({ isPro: false });
  }

  // List active subscriptions for this customer from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: org.stripeCustomerId,
    status: "active",
    limit: 1,
  });

  const activeSub = subscriptions.data[0];

  if (!activeSub) {
    // No active subscription — downgrade to FREE if DB still shows PRO
    if (org.plan === "PRO") {
      await db.organization.update({
        where: { id: org.id },
        data: {
          plan: "FREE",
          stripeSubscriptionId: null,
          aiCreditsBalance: 0,
          aiCreditsResetAt: null,
        },
      });
    }
    return NextResponse.json({ isPro: false });
  }

  // Sync to DB if not already PRO
  if (org.plan !== "PRO") {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    await db.organization.update({
      where: { id: org.id },
      data: {
        plan: "PRO",
        stripeSubscriptionId: activeSub.id,
        aiCreditsBalance: MONTHLY_CREDITS,
        aiCreditsResetAt: nextReset,
      },
    });
  }

  return NextResponse.json({ isPro: true });
}
