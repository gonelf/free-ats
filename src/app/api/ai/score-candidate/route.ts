import { NextRequest, NextResponse } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { scoreCandidate } from "@/lib/ai/scorer";
import { db } from "@/lib/db";

type WorkExperience = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

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

    const c = app.candidate;
    const experience = (c.workExperience as WorkExperience[] | null) ?? [];

    // Require summary, at least one skill, and at least one work experience entry
    const missing: string[] = [];
    if (!c.summary) missing.push("professional summary");
    if (!c.tags.length) missing.push("skills");
    if (!experience.length) missing.push("work experience");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Complete the candidate profile before scoring. Missing: ${missing.join(", ")}.`,
        },
        { status: 422 }
      );
    }

    const experienceText = experience
      .map(
        (e) =>
          `${e.title} at ${e.company} (${e.startDate}–${e.endDate})\n${e.description}`
      )
      .join("\n\n");

    const achievementsText =
      c.achievements.length > 0
        ? `Achievements:\n${c.achievements.map((a) => `- ${a}`).join("\n")}`
        : "";

    const candidateProfile = [
      `Name: ${c.firstName} ${c.lastName}`,
      `Summary: ${c.summary}`,
      `Skills: ${c.tags.join(", ")}`,
      experienceText && `Work Experience:\n${experienceText}`,
      achievementsText,
      c.resumeText && `Additional resume context:\n${c.resumeText}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await scoreCandidate(
      candidateProfile,
      app.job.description,
      app.job.requirements || ""
    );

    await db.application.update({
      where: { id: applicationId },
      data: {
        aiScore: result.score,
        aiScoreSummary: {
          strengths: result.strengths,
          gaps: result.gaps,
          recommendation: result.recommendation,
        },
      },
    });

    return result;
  }, 5);
}
