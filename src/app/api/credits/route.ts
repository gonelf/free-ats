import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { MONTHLY_CREDITS } from "@/lib/ai/credits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await db.member.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });

    if (!member) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const org = await db.organization.findUniqueOrThrow({
      where: { id: member.organizationId },
      select: {
        plan: true,
        aiCreditsBalance: true,
        aiCreditsResetAt: true,
      },
    });

    return NextResponse.json({
      balance: org.aiCreditsBalance,
      monthly: MONTHLY_CREDITS,
      resetAt: org.aiCreditsResetAt,
      isPro: org.plan === "PRO",
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}
