import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { draftEmail, type EmailType } from "@/lib/ai/email-drafter";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { type, candidateId, jobId, additionalContext } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const [candidate, job, org] = await Promise.all([
      db.candidate.findFirstOrThrow({ where: { id: candidateId, organizationId: orgId } }),
      db.job.findFirstOrThrow({ where: { id: jobId, organizationId: orgId } }),
      db.organization.findUniqueOrThrow({ where: { id: orgId }, select: { name: true } }),
    ]);

    return draftEmail({
      type: type as EmailType,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      jobTitle: job.title,
      companyName: org.name,
      additionalContext,
    });
  }, 5);
}
