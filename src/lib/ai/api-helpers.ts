import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";
import { FREE_TRIAL_CREDITS, MONTHLY_CREDITS } from "@/lib/ai/credits";

/**
 * Atomically check credits, reset Pro monthly allowance if due, and deduct.
 *
 * Free plan: fixed 100 trial credits, never resets.
 * Pro plan:  2,500 credits, resets monthly (aiCreditsResetAt tracks next reset).
 */
async function consumeCredits(
  orgId: string,
  cost: number
): Promise<
  | { ok: true; remaining: number; isPro: boolean }
  | { ok: false; remaining: number; isPro: boolean; resetAt: Date | null }
> {
  return db.$transaction(async (tx) => {
    const org = await tx.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { plan: true, aiCreditsBalance: true, aiCreditsResetAt: true },
    });

    const isPro = org.plan === "PRO";
    const now = new Date();
    let balance = org.aiCreditsBalance;

    // Pro only: top up monthly when the reset date has passed (or is unset)
    if (isPro && (!org.aiCreditsResetAt || org.aiCreditsResetAt <= now)) {
      balance = MONTHLY_CREDITS;
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      await tx.organization.update({
        where: { id: orgId },
        data: { aiCreditsBalance: MONTHLY_CREDITS, aiCreditsResetAt: nextReset },
      });
    }

    if (balance < cost) {
      return {
        ok: false as const,
        remaining: balance,
        isPro,
        resetAt: isPro ? org.aiCreditsResetAt : null,
      };
    }

    const updated = await tx.organization.update({
      where: { id: orgId },
      data: { aiCreditsBalance: { decrement: cost } },
      select: { aiCreditsBalance: true },
    });

    return { ok: true as const, remaining: updated.aiCreditsBalance, isPro };
  });
}

export async function withProPlanGuard<T>(
  handler: (orgId: string) => Promise<T>,
  creditCost: number = 1
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await checkRateLimit(user.id);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const member = await db.member.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    if (!member) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const credits = await consumeCredits(member.organizationId, creditCost);

    if (!credits.ok) {
      const message = credits.isPro
        ? `You have ${credits.remaining} credits remaining. Your ${MONTHLY_CREDITS}-credit allowance resets on ${credits.resetAt?.toLocaleDateString("en-US", { month: "long", day: "numeric" }) ?? "next month"}.`
        : `You've used all ${FREE_TRIAL_CREDITS} trial credits. Upgrade to Pro for ${MONTHLY_CREDITS} credits every month.`;

      return NextResponse.json(
        {
          error: "Insufficient AI credits",
          message,
          remaining: credits.remaining,
          isPro: credits.isPro,
          resetAt: credits.resetAt,
        },
        { status: 402 }
      );
    }

    const result = await handler(member.organizationId);
    return NextResponse.json({
      ...(result as object),
      _credits: { used: creditCost, remaining: credits.remaining },
    });
  } catch (error) {
    console.error("[AI API Error]", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
