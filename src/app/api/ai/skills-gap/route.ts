import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { analyzeSkillsGap } from "@/lib/ai/job-generator";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { candidateId, jobId } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const [candidate, job] = await Promise.all([
      db.candidate.findFirstOrThrow({ where: { id: candidateId, organizationId: orgId } }),
      db.job.findFirstOrThrow({ where: { id: jobId, organizationId: orgId } }),
    ]);

    const candidateSkills = `Skills: ${candidate.tags.join(", ")}\n${candidate.resumeText?.slice(0, 1500) || ""}`;

    return analyzeSkillsGap(candidateSkills, job.requirements || job.description);
  });
}
