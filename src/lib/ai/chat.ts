import { flashModel } from "@/lib/ai/gemini";

export type GeminiChatMessage = {
  role: "user" | "model";
  parts: [{ text: string }];
};

export interface OrgContext {
  orgName: string;
  plan: string;
  jobsCount: number;
  openJobsCount: number;
  candidatesCount: number;
}

export function buildSystemPrompt(ctx: OrgContext): string {
  return `You are Kite, a helpful AI assistant built into KiteHR — an Applicant Tracking System for ${ctx.orgName} (${ctx.plan} plan).

Current workspace data: ${ctx.jobsCount} total jobs (${ctx.openJobsCount} open), ${ctx.candidatesCount} candidates.

You help HR teams with:
- Finding and reviewing candidates
- Creating and refining job postings
- Writing job descriptions, outreach emails, and interview questions
- Understanding pipelines, reports, and hiring workflows
- General HR best practices and guidance

When suggesting navigation, use these relative markdown links:
- Create a job: [Create a job](/jobs/new)
- Browse jobs: [Browse jobs](/jobs)
- Browse candidates: [Browse candidates](/candidates)
- Pipelines: [Pipelines](/pipelines)
- Reports: [Reports](/reports)

Be concise and practical. You cannot create or modify records directly — guide the user to the right page instead. Always use relative markdown links (starting with /).`;
}

export async function streamChatResponse(
  history: GeminiChatMessage[],
  newMessage: string,
  ctx: OrgContext
) {
  const chat = flashModel.startChat({
    history,
    systemInstruction: buildSystemPrompt(ctx),
  });
  return chat.sendMessageStream(newMessage);
}
