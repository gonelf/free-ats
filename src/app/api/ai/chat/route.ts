import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";
import { FREE_TRIAL_CREDITS, MONTHLY_CREDITS } from "@/lib/ai/credits";
import { streamChatResponse, type GeminiChatMessage } from "@/lib/ai/chat";

export const maxDuration = 60;

const CHAT_CREDIT_COST = 2;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimitResponse = await checkRateLimit(user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });
  if (!member) return NextResponse.json({ error: "No organization" }, { status: 403 });

  const { message, history }: { message: string; history: GeminiChatMessage[] } =
    await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const org = member.organization;
  const isPro = org.plan === "PRO";
  const now = new Date();

  // Atomically check and deduct credits
  const credits = await db.$transaction(async (tx) => {
    const current = await tx.organization.findUniqueOrThrow({
      where: { id: org.id },
      select: { aiCreditsBalance: true, aiCreditsResetAt: true, plan: true },
    });

    let balance = current.aiCreditsBalance;

    // Pro only: reset monthly allowance if due
    if (isPro && (!current.aiCreditsResetAt || current.aiCreditsResetAt <= now)) {
      balance = MONTHLY_CREDITS;
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      await tx.organization.update({
        where: { id: org.id },
        data: { aiCreditsBalance: MONTHLY_CREDITS, aiCreditsResetAt: nextReset },
      });
    }

    if (balance < CHAT_CREDIT_COST) {
      return { ok: false as const, remaining: balance };
    }

    const updated = await tx.organization.update({
      where: { id: org.id },
      data: { aiCreditsBalance: { decrement: CHAT_CREDIT_COST } },
      select: { aiCreditsBalance: true },
    });

    return { ok: true as const, remaining: updated.aiCreditsBalance };
  });

  if (!credits.ok) {
    const msg = isPro
      ? `You have ${credits.remaining} credits left. Your allowance resets next month.`
      : `You've used all ${FREE_TRIAL_CREDITS} trial credits. [Upgrade to Pro](/settings/billing) for ${MONTHLY_CREDITS} credits/month.`;
    return NextResponse.json(
      { error: "Insufficient AI credits", message: msg },
      { status: 402 }
    );
  }

  // Fetch live org context for system prompt
  const [jobsCount, openJobsCount, candidatesCount] = await Promise.all([
    db.job.count({ where: { organizationId: org.id } }),
    db.job.count({ where: { organizationId: org.id, status: "OPEN" } }),
    db.candidate.count({ where: { organizationId: org.id } }),
  ]);

  const orgContext = {
    orgName: org.name,
    plan: org.plan,
    jobsCount,
    openJobsCount,
    candidatesCount,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await streamChatResponse(history, message, orgContext);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, creditsRemaining: credits.remaining })}\n\n`
          )
        );
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Generation failed" })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
