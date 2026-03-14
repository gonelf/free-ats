import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { generateInterviewQuestions } from "@/lib/ai/job-generator";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { candidateId, jobId } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const [candidate, job] = await Promise.all([
      db.candidate.findFirstOrThrow({ where: { id: candidateId, organizationId: orgId } }),
      db.job.findFirstOrThrow({ where: { id: jobId, organizationId: orgId } }),
    ]);

    const background = `
      ${candidate.firstName} ${candidate.lastName}
      Skills: ${candidate.tags.join(", ")}
      ${candidate.resumeText?.slice(0, 1000) || ""}
    `.trim();

    return generateInterviewQuestions(job.title, background);
  }, 5);
}
