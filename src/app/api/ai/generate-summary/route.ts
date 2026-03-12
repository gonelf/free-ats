import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { generateCandidateSummary } from "@/lib/ai/summarizer";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { candidateId } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const candidate = await db.candidate.findFirstOrThrow({
      where: { id: candidateId, organizationId: orgId },
    });

    const profile = `
      Name: ${candidate.firstName} ${candidate.lastName}
      Email: ${candidate.email}
      ${candidate.phone ? `Phone: ${candidate.phone}` : ""}
      ${candidate.linkedinUrl ? `LinkedIn: ${candidate.linkedinUrl}` : ""}
      ${candidate.tags.length > 0 ? `Tags: ${candidate.tags.join(", ")}` : ""}
      ${candidate.resumeText ? `Resume:\n${candidate.resumeText}` : ""}
    `.trim();

    const summary = await generateCandidateSummary(profile);

    // Cache the summary
    await db.aiSummary.upsert({
      where: { candidateId },
      create: {
        candidateId,
        summary,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        summary,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { summary };
  });
}
