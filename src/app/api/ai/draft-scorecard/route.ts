import { NextRequest, NextResponse } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { flashModel, generateJSON } from "@/lib/ai/gemini";
import { db } from "@/lib/db";

interface RubricScore {
  criterion: string;
  score: number; // 1-5
  notes: string;
}

interface ScorecardDraft {
  rubricScores: RubricScore[];
  overallRating: number; // 1-5
  recommendation: "STRONG_YES" | "YES" | "MAYBE" | "NO" | "STRONG_NO";
  notes: string;
}

type InterviewQuestions = {
  behavioral?: string[];
  technical?: string[];
  culture?: string[];
};

export async function POST(request: NextRequest) {
  const { interviewId } = await request.json();

  return withProPlanGuard(async (orgId) => {
    const interview = await db.interview.findFirstOrThrow({
      where: {
        id: interviewId,
        application: { job: { organizationId: orgId } },
      },
      include: {
        application: {
          include: {
            job: { select: { title: true, description: true, requirements: true } },
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                summary: true,
                tags: true,
                workExperience: true,
              },
            },
          },
        },
      },
    });

    const app = interview.application;
    const candidate = app.candidate;
    const job = app.job;
    const questions = app.aiInterviewQuestions as InterviewQuestions | null;

    const questionsList: string[] = [
      ...(questions?.behavioral ?? []),
      ...(questions?.technical ?? []),
      ...(questions?.culture ?? []),
    ];

    const candidateSummary = [
      `Name: ${candidate.firstName} ${candidate.lastName}`,
      candidate.summary ? `Summary: ${candidate.summary}` : "",
      candidate.tags.length ? `Skills: ${candidate.tags.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const draft = await generateJSON<ScorecardDraft>(
      flashModel,
      `You are an AI interview scorecard assistant. Based on the job requirements and candidate profile, generate a pre-filled interview scorecard draft.

Job: ${job.title}
Requirements: ${job.requirements || job.description}

Candidate: ${candidateSummary}

${questionsList.length > 0 ? `Interview Questions:\n${questionsList.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : ""}

Generate a scorecard with:
- rubricScores: array of { criterion: string, score: number (1-5 initial estimate, can be 3 for unknown), notes: string (what to probe during interview) } — one per key competency area from the job requirements (3-5 items)
- overallRating: 1-5 (initial estimate based on profile)
- recommendation: "STRONG_YES" | "YES" | "MAYBE" | "NO" | "STRONG_NO" (based on profile match)
- notes: a 1-2 sentence pre-interview briefing for the interviewer

Important: scores are estimates to be updated during the interview. Notes should be interview guidance, not final verdicts.`
    );

    return NextResponse.json(draft);
  }, 10);
}
