import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { generateReferenceQuestions } from "@/lib/ai/job-generator";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { candidateId, jobId, applicationId } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const [candidate, job] = await Promise.all([
      db.candidate.findFirstOrThrow({ where: { id: candidateId, organizationId: orgId } }),
      db.job.findFirstOrThrow({ where: { id: jobId, organizationId: orgId } }),
    ]);

    const background = `${candidate.firstName} ${candidate.lastName} - ${candidate.tags.join(", ")}`;

    const result = await generateReferenceQuestions(job.title, background);

    if (applicationId) {
      await db.application.updateMany({
        where: { id: applicationId, candidateId, jobId },
        data: { aiReferenceQuestions: result },
      });
    }

    return result;
  }, 3);
}
