import { NextRequest, NextResponse } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { draftRejectionEmail } from "@/lib/ai/email-drafter";
import { db } from "@/lib/db";

interface ScoreSummary {
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export async function POST(request: NextRequest) {
  const { applicationId } = await request.json();

  return withProPlanGuard(async (orgId) => {
    const app = await db.application.findFirstOrThrow({
      where: {
        id: applicationId,
        job: { organizationId: orgId },
      },
      include: {
        job: { select: { title: true, organization: { select: { name: true } } } },
        candidate: { select: { firstName: true, lastName: true } },
      },
    });

    const summary = app.aiScoreSummary as ScoreSummary | null;

    const result = await draftRejectionEmail({
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      jobTitle: app.job.title,
      companyName: app.job.organization.name,
      strengths: summary?.strengths ?? [],
      gaps: summary?.gaps ?? [],
      recommendation: summary?.recommendation ?? "",
    });

    return NextResponse.json(result);
  }, 3);
}
