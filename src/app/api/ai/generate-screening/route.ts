import { NextRequest, NextResponse } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { flashModel, generateJSON } from "@/lib/ai/gemini";
import { db } from "@/lib/db";

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

    // Check if screening already exists
    const existing = await db.screening.findUnique({ where: { applicationId } });
    if (existing) {
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

    const screening = await db.screening.create({
      data: {
        applicationId,
        questions: questions as object[],
      },
    });

    return NextResponse.json(screening, { status: 201 });
  }, 5);
}
