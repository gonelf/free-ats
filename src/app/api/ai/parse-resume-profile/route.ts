import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { parseResume } from "@/lib/ai/resume-parser";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({ where: { userId: user.id } });
  if (!member) return NextResponse.json({ error: "No org" }, { status: 403 });

  const { candidateId } = await request.json();

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, organizationId: member.organizationId },
    select: { resumeText: true },
  });

  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  if (!candidate.resumeText) {
    return NextResponse.json({ error: "No resume text available. Upload a resume first." }, { status: 400 });
  }

  return withProPlanGuard(async () => {
    return parseResume(candidate.resumeText!);
  }, 10);
}
