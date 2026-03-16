import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { parseResume, parseResumeFromPdf } from "@/lib/ai/resume-parser";
import { getResumeBytes } from "@/lib/r2";

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
    select: { resumeUrl: true, resumeText: true, resumeExpiresAt: true },
  });

  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  if (!candidate.resumeUrl && !candidate.resumeText) {
    return NextResponse.json({ error: "No resume uploaded for this candidate." }, { status: 400 });
  }

  if (candidate.resumeExpiresAt && candidate.resumeExpiresAt < new Date()) {
    return NextResponse.json({ error: "Resume has expired. Upgrade to Pro to retain resumes." }, { status: 410 });
  }

  return withProPlanGuard(async () => {
    // Prefer stored text if available; otherwise fetch PDF from R2
    if (candidate.resumeText) {
      return parseResume(candidate.resumeText);
    }
    const pdfBuffer = await getResumeBytes(candidate.resumeUrl!);
    const pdfBase64 = pdfBuffer.toString("base64");
    return parseResumeFromPdf(pdfBase64);
  }, 10);
}
