import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { tagCandidate } from "@/lib/ai/job-generator";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { candidateId } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const candidate = await db.candidate.findFirstOrThrow({
      where: { id: candidateId, organizationId: orgId },
    });

    const profile = `
      ${candidate.firstName} ${candidate.lastName}
      ${candidate.resumeText || ""}
    `.trim();

    const tags = await tagCandidate(profile);

    await db.candidate.update({
      where: { id: candidateId },
      data: { tags },
    });

    return { tags };
  });
}
