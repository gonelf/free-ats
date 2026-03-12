import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { PaymentRequiredError, requireProPlan } from "@/lib/ai-gate";

export async function withProPlanGuard<T>(
  handler: (orgId: string) => Promise<T>
): Promise<NextResponse> {
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

    await requireProPlan(member.organizationId);
    const result = await handler(member.organizationId);
    return NextResponse.json(result);
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
