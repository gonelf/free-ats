import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { flashModel, generateJSON } from "@/lib/ai/gemini";

interface ScreeningQuestion {
  id: string;
  question: string;
  type: string;
  intent?: string;
}

interface ScreeningResponse {
  questionId: string;
  answer: string;
  answeredAt: string;
}

interface FlagAnalysis {
  flagged: boolean;
  reason: string | null;
  followUpQuestion: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { questionId, answer } = await request.json();

  if (!answer?.trim()) {
    return NextResponse.json({ error: "Answer is required" }, { status: 400 });
  }

  const screening = await db.screening.findUnique({ where: { screeningToken: token } });
  if (!screening) {
    return NextResponse.json({ error: "Screening not found" }, { status: 404 });
  }

  // Reject expired tokens
  if (
    screening.screeningTokenExpiresAt &&
    screening.screeningTokenExpiresAt < new Date()
  ) {
    return NextResponse.json({ error: "Screening link has expired" }, { status: 410 });
  }

  if (screening.completedAt) {
    return NextResponse.json({ error: "Screening already completed" }, { status: 400 });
  }

  const existingResponses = (screening.responses as ScreeningResponse[] | null) ?? [];
  const questions = screening.questions as ScreeningQuestion[];

  // Add the new response
  const newResponse: ScreeningResponse = {
    questionId,
    answer: answer.trim(),
    answeredAt: new Date().toISOString(),
  };
  const updatedResponses = [...existingResponses, newResponse];

  // Analyze the answer for integrity signals
  const question = questions.find((q) => q.id === questionId);
  const analysis = await generateJSON<FlagAnalysis>(
    flashModel,
    `Analyze this screening response for authenticity signals.

Question: "${question?.question ?? ""}"
${question?.intent ? `Intent: ${question.intent}` : ""}
Answer: "${answer.trim()}"

Evaluate:
1. Does it feel genuinely human? (specific details, personal voice, slight imperfections)
2. Is it overly polished, generic, or structured like an AI response?
3. Does it actually address the specific question or is it vague filler?

Return JSON:
- flagged: boolean (true if the response seems AI-generated or evasive)
- reason: string or null (brief reason if flagged, e.g. "Response is generic and doesn't address the specific question")
- followUpQuestion: string or null (a follow-up question to probe further if answer was vague/suspicious, null if clear and genuine)`
  );

  // Determine if all questions have been answered
  const allAnswered = questions.every((q) =>
    updatedResponses.some((r) => r.questionId === q.id)
  );

  const updated = await db.screening.update({
    where: { screeningToken: token },
    data: {
      responses: updatedResponses as object[],
      flagged: analysis.flagged || screening.flagged,
      flagReason: analysis.flagged
        ? analysis.reason ?? "Suspicious response detected"
        : screening.flagReason,
      completedAt: allAnswered ? new Date() : null,
    },
  });

  return NextResponse.json({
    screening: updated,
    followUpQuestion: analysis.followUpQuestion,
    allAnswered,
  });
}
