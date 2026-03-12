import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { scoreCandidate } from "@/lib/ai/scorer";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { applicationId } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const app = await db.application.findFirstOrThrow({
      where: {
        id: applicationId,
        job: { organizationId: orgId },
      },
      include: {
        job: true,
        candidate: true,
      },
    });

    const candidateProfile = `
      Name: ${app.candidate.firstName} ${app.candidate.lastName}
      Skills: ${app.candidate.tags.join(", ")}
      ${app.candidate.resumeText || ""}
    `.trim();

    const result = await scoreCandidate(
      candidateProfile,
      app.job.description,
      app.job.requirements || ""
    );

    // Store the score
    await db.application.update({
      where: { id: applicationId },
      data: { aiScore: result.score },
    });

    return result;
  });
}
