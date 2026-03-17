import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { draftEmail, type EmailType } from "@/lib/ai/email-drafter";
import { db } from "@/lib/db";
import { EmailType as PrismaEmailType } from "@prisma/client";

export async function POST(request: NextRequest) {
  const { type, candidateId, jobId, additionalContext } = await request.json();
  return withProPlanGuard(async (orgId, userId) => {
    const [candidate, job, org] = await Promise.all([
      db.candidate.findFirstOrThrow({ where: { id: candidateId, organizationId: orgId } }),
      jobId
        ? db.job.findFirstOrThrow({ where: { id: jobId, organizationId: orgId } })
        : Promise.resolve(null),
      db.organization.findUniqueOrThrow({ where: { id: orgId }, select: { name: true } }),
    ]);

    const result = await draftEmail({
      type: type as EmailType,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      jobTitle: job?.title ?? "this role",
      companyName: org.name,
      additionalContext,
    });

    const communication = await db.communication.create({
      data: {
        candidateId,
        organizationId: orgId,
        jobId: jobId ?? null,
        type: type.toUpperCase() as PrismaEmailType,
        subject: result.subject,
        body: result.body,
        authorId: userId,
      },
    });

    return { ...result, communicationId: communication.id };
  }, 5);
}
