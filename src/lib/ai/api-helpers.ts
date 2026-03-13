import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { PaymentRequiredError, requireProPlan } from "@/lib/ai-gate";
import { checkRateLimit } from "@/lib/ratelimit";
import { MONTHLY_CREDITS } from "@/lib/ai/credits";

/**
 * Atomically check credits, reset monthly allowance if due, and deduct cost.
 * Returns { ok: true, remaining } or { ok: false, remaining, resetAt }.
 */
async function consumeCredits(
  orgId: string,
  cost: number
): Promise<
  | { ok: true; remaining: number }
  | { ok: false; remaining: number; resetAt: Date | null }
> {
  return db.$transaction(async (tx) => {
    const org = await tx.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { aiCreditsBalance: true, aiCreditsResetAt: true },
    });

    const now = new Date();
    let balance = org.aiCreditsBalance;

    // Monthly reset: if resetAt is null (new org) or has passed, top up
    if (!org.aiCreditsResetAt || org.aiCreditsResetAt <= now) {
      balance = MONTHLY_CREDITS;
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      await tx.organization.update({
        where: { id: orgId },
        data: { aiCreditsBalance: MONTHLY_CREDITS, aiCreditsResetAt: nextReset },
      });
    }

    if (balance < cost) {
      return { ok: false as const, remaining: balance, resetAt: org.aiCreditsResetAt };
    }

    const updated = await tx.organization.update({
      where: { id: orgId },
      data: { aiCreditsBalance: { decrement: cost } },
      select: { aiCreditsBalance: true },
    });

    return { ok: true as const, remaining: updated.aiCreditsBalance };
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

    // Rate limit per user
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

    await requireProPlan(member.organizationId);

    // Check and deduct credits
    const credits = await consumeCredits(member.organizationId, creditCost);
    if (!credits.ok) {
      const resetDate = credits.resetAt
        ? credits.resetAt.toLocaleDateString("en-US", { month: "long", day: "numeric" })
        : "next month";
      return NextResponse.json(
        {
          error: "Insufficient AI credits",
          message: `You have ${credits.remaining} credits remaining. Your allowance of ${MONTHLY_CREDITS} credits resets on ${resetDate}.`,
          remaining: credits.remaining,
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
    if (error instanceof PaymentRequiredError) {
      return NextResponse.json(
        { error: "Upgrade to Pro to use AI features" },
        { status: 402 }
      );
    }
    console.error("[AI API Error]", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
