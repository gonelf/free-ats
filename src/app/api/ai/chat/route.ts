import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";
import { FREE_TRIAL_CREDITS, MONTHLY_CREDITS } from "@/lib/ai/credits";
import {
  getChatDecision,
  executeToolCall,
  ACTION_CREDIT_COSTS,
  type GeminiChatMessage,
} from "@/lib/ai/chat";

export const maxDuration = 60;

async function deductCredits(
  orgId: string,
  cost: number,
  isPro: boolean
): Promise<{ ok: boolean; remaining: number }> {
  const now = new Date();
  return db.$transaction(async (tx) => {
    const current = await tx.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { aiCreditsBalance: true, aiCreditsResetAt: true },
    });

    let balance = current.aiCreditsBalance;

    if (isPro && (!current.aiCreditsResetAt || current.aiCreditsResetAt <= now)) {
      balance = MONTHLY_CREDITS;
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      await tx.organization.update({
        where: { id: orgId },
        data: { aiCreditsBalance: MONTHLY_CREDITS, aiCreditsResetAt: nextReset },
      });
    }

    if (balance < cost) return { ok: false, remaining: balance };

    const updated = await tx.organization.update({
      where: { id: orgId },
      data: { aiCreditsBalance: { decrement: cost } },
      select: { aiCreditsBalance: true },
    });

    return { ok: true, remaining: updated.aiCreditsBalance };
  });
}

function streamText(
  text: string,
  creditsRemaining: number,
  meta?: { actionUsed: string; creditsCost: number }
): Response {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of words) {
        if (chunk) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
          );
          await new Promise((r) => setTimeout(r, 8));
        }
      }
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ done: true, creditsRemaining, ...meta })}\n\n`
        )
      );
      controller.close();
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

  // Ask Gemini what to do (may return text or a tool call)
  let decision: Awaited<ReturnType<typeof getChatDecision>>;
  try {
    decision = await getChatDecision(history, message, orgContext);
  } catch (err) {
    console.error("[chat] getChatDecision failed:", err);
    return NextResponse.json(
      { error: "AI service error. Please try again." },
      { status: 500 }
    );
  }

  // Plain Q&A — no credits charged
  if (!decision.toolName) {
    const currentBalance = await db.organization
      .findUnique({ where: { id: org.id }, select: { aiCreditsBalance: true } })
      .then((o) => o?.aiCreditsBalance ?? 0);

    return streamText(decision.text, currentBalance);
  }

  // Tool action — check and deduct credits
  const actionCost = ACTION_CREDIT_COSTS[decision.toolName] ?? 5;
  const credits = await deductCredits(org.id, actionCost, isPro);

  if (!credits.ok) {
    const msg = isPro
      ? `You have ${credits.remaining} credits left. Your allowance resets next month.`
      : `You've used all ${FREE_TRIAL_CREDITS} trial credits. [Upgrade to Pro](/settings/billing) for ${MONTHLY_CREDITS} credits/month.`;
    return NextResponse.json(
      { error: "Insufficient AI credits", message: msg },
      { status: 402 }
    );
  }

  // Execute the tool
  let toolResult: string;
  try {
    toolResult = await executeToolCall(decision.toolName, decision.toolArgs ?? {}, org.id);
  } catch {
    return NextResponse.json({ error: "Action failed. Please try again." }, { status: 500 });
  }

  return streamText(toolResult, credits.remaining, {
    actionUsed: decision.toolName,
    creditsCost: actionCost,
  });
}
