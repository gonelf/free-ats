import { NextRequest, NextResponse } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { flashModel, generateJSON } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

interface ScreeningQuestion {
  id: string;
  question: string;
  type: "initial";
  intent: string; // what this question is trying to assess (not shown to candidate)
}

interface ScreeningQuestionsResult {
  questions: ScreeningQuestion[];
}

export async function POST(request: NextRequest) {
  const { applicationId } = await request.json();

  return withProPlanGuard(async (orgId) => {
    const application = await db.application.findFirstOrThrow({
      where: { id: applicationId, job: { organizationId: orgId } },
      include: {
        job: { select: { title: true, description: true, requirements: true } },
        candidate: { select: { firstName: true, lastName: true, summary: true, tags: true } },
      },
    });

    // Check if screening already exists — backfill token if missing
    const existing = await db.screening.findUnique({ where: { applicationId } });
    if (existing) {
      if (!existing.screeningToken) {
        const token = randomUUID().replace(/-/g, "");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const updated = await db.screening.update({
          where: { applicationId },
          data: { screeningToken: token, screeningTokenExpiresAt: expiresAt },
        });
        return NextResponse.json(updated);
      }
      return NextResponse.json(existing);
    }

    const { questions } = await generateJSON<ScreeningQuestionsResult>(
      flashModel,
      `Generate 4-5 adaptive screening questions for a job applicant.

Job: ${application.job.title}
Requirements: ${application.job.requirements || application.job.description}

Candidate: ${application.candidate.firstName} ${application.candidate.lastName}
${application.candidate.summary ? `Summary: ${application.candidate.summary}` : ""}
${application.candidate.tags.length ? `Skills: ${application.candidate.tags.join(", ")}` : ""}

Requirements for questions:
1. First question should be an open-ended warm-up about their background
2. 2-3 questions should probe specific skills or experiences required for this role
3. One question should require real reasoning/problem-solving (not Googleable)
4. Questions should be conversational, not interrogative
5. Questions must require genuine thought — AI-generated boilerplate answers should be detectable

Return JSON with:
- questions: array of { id: string (use "q1", "q2", etc.), question: string, type: "initial", intent: string (what you're assessing) }`
    );

    const token = randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const screening = await db.screening.create({
      data: {
        applicationId,
        questions: questions as object[],
        screeningToken: token,
        screeningTokenExpiresAt: expiresAt,
      },
    });

    return NextResponse.json(screening, { status: 201 });
  }, 5);
}
