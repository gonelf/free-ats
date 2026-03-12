import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { generateOfferLetter } from "@/lib/ai/job-generator";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { candidateId, jobId, salary, startDate, additionalTerms } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const [candidate, job, org] = await Promise.all([
      db.candidate.findFirstOrThrow({ where: { id: candidateId, organizationId: orgId } }),
      db.job.findFirstOrThrow({ where: { id: jobId, organizationId: orgId } }),
      db.organization.findUniqueOrThrow({ where: { id: orgId }, select: { name: true } }),
    ]);

    const letter = await generateOfferLetter({
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      jobTitle: job.title,
      companyName: org.name,
      salary,
      startDate,
      additionalTerms,
    });

    return { letter };
  });
}
