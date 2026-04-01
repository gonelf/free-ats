import { flashModel } from "@/lib/ai/gemini";
import {
  generateJobDescription,
  generateInterviewQuestions,
  suggestSalaryRange,
  checkJobBias,
} from "@/lib/ai/job-generator";
import { draftEmail } from "@/lib/ai/email-drafter";
import { AI_CREDIT_COSTS } from "@/lib/ai/credits";
import type { FunctionDeclaration } from "@google/generative-ai";

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

// Credit cost for each tool action (maps to existing AI_CREDIT_COSTS keys)
export const ACTION_CREDIT_COSTS: Record<string, number> = {
  generate_job_description: AI_CREDIT_COSTS["generate-job-description"], // 8
  draft_email: AI_CREDIT_COSTS["draft-email"],                           // 5
  suggest_interview_questions: AI_CREDIT_COSTS["suggest-questions"],     // 5
  suggest_salary_range: AI_CREDIT_COSTS["suggest-salary"],               // 3
  check_job_bias: AI_CREDIT_COSTS["check-job-bias"],                     // 3
};

// Gemini function declarations for tool use
export const chatToolDeclarations: FunctionDeclaration[] = [
  {
    name: "generate_job_description",
    description:
      "Generate a complete job description for a given role. Use when the user asks to write, create, or draft a job description or job posting.",
    parameters: {
      type: "object" as const,
      properties: {
        title: { type: "string" as const, description: "Job title" },
        context: {
          type: "string" as const,
          description: "Additional context about the role, team, or requirements",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "draft_email",
    description:
      "Draft a professional email to a candidate. Use when the user asks to write or draft an outreach, rejection, interview invite, follow-up, or offer email.",
    parameters: {
      type: "object" as const,
      properties: {
        type: {
          type: "string" as const,
          enum: ["outreach", "rejection", "offer", "interview_invite", "follow_up"],
        },
        candidateName: { type: "string" as const },
        jobTitle: { type: "string" as const },
        companyName: { type: "string" as const },
        additionalContext: { type: "string" as const },
      },
      required: ["type", "candidateName", "jobTitle", "companyName"],
    },
  },
  {
    name: "suggest_interview_questions",
    description:
      "Generate tailored interview questions for a role and candidate. Use when the user asks for interview questions.",
    parameters: {
      type: "object" as const,
      properties: {
        jobTitle: { type: "string" as const },
        candidateBackground: {
          type: "string" as const,
          description: "Candidate's background or skills (optional)",
        },
      },
      required: ["jobTitle"],
    },
  },
  {
    name: "suggest_salary_range",
    description:
      "Suggest a market salary range for a position. Use when the user asks about salary, pay, or compensation for a role.",
    parameters: {
      type: "object" as const,
      properties: {
        title: { type: "string" as const },
        location: { type: "string" as const },
        seniority: {
          type: "string" as const,
          description: "e.g. junior, mid, senior, lead",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "check_job_bias",
    description:
      "Check a job description for biased or exclusionary language. Use when the user asks to review or check a job description for bias.",
    parameters: {
      type: "object" as const,
      properties: {
        jobText: {
          type: "string" as const,
          description: "The job description text to analyze",
        },
      },
      required: ["jobText"],
    },
  },
];

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

You have tools available to generate content directly. Use them when the user asks you to create or draft something. For plain questions and guidance, just respond with text — no tool needed.

Be concise and practical.`;
}

export interface ChatDecision {
  text: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

// First-pass call to Gemini — detects whether a tool is needed
export async function getChatDecision(
  history: GeminiChatMessage[],
  newMessage: string,
  ctx: OrgContext
): Promise<ChatDecision> {
  const chat = flashModel.startChat({
    history,
    systemInstruction: buildSystemPrompt(ctx),
    tools: [{ functionDeclarations: chatToolDeclarations }],
  });

  const result = await chat.sendMessage(newMessage);
  const response = result.response;

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.functionCall) {
      return {
        text: "",
        toolName: part.functionCall.name,
        toolArgs: part.functionCall.args as Record<string, unknown>,
      };
    }
  }

  return { text: response.text() };
}

// Execute the tool and return a formatted markdown result
export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case "generate_job_description": {
      const result = await generateJobDescription(
        args.title as string,
        args.context as string | undefined
      );
      const salaryLine =
        result.salaryRange
          ? `\n\n**Suggested Salary:** ${result.salaryRange.currency} ${result.salaryRange.min.toLocaleString()} – ${result.salaryRange.max.toLocaleString()}`
          : "";
      const skillsLine =
        result.skills?.length
          ? `\n\n**Key Skills:** ${result.skills.join(", ")}`
          : "";
      return `## ${args.title} — Job Description\n\n${result.description}\n\n**Requirements:**\n${result.requirements}${skillsLine}${salaryLine}`;
    }

    case "draft_email": {
      const result = await draftEmail({
        type: args.type as "outreach" | "rejection" | "offer" | "interview_invite" | "follow_up",
        candidateName: args.candidateName as string,
        jobTitle: args.jobTitle as string,
        companyName: args.companyName as string,
        additionalContext: args.additionalContext as string | undefined,
      });
      return `**Subject:** ${result.subject}\n\n${result.body}`;
    }

    case "suggest_interview_questions": {
      const result = await generateInterviewQuestions(
        args.jobTitle as string,
        (args.candidateBackground as string) ?? ""
      );
      const sections = [
        result.behavioral?.length
          ? `**Behavioral**\n${result.behavioral.map((q) => `- ${q}`).join("\n")}`
          : "",
        result.technical?.length
          ? `**Technical**\n${result.technical.map((q) => `- ${q}`).join("\n")}`
          : "",
        result.culture?.length
          ? `**Culture Fit**\n${result.culture.map((q) => `- ${q}`).join("\n")}`
          : "",
      ].filter(Boolean);
      return sections.join("\n\n");
    }

    case "suggest_salary_range": {
      const result = await suggestSalaryRange(
        args.title as string,
        (args.location as string) ?? "US",
        (args.seniority as string) ?? "mid"
      );
      return `**Suggested Salary Range:** ${result.currency} ${result.min.toLocaleString()} – ${result.max.toLocaleString()}${result.notes ? `\n\n${result.notes}` : ""}`;
    }

    case "check_job_bias": {
      const result = await checkJobBias(args.jobText as string);
      const issueList =
        result.issues?.length
          ? result.issues
              .map((i) => `- **"${i.text}"** → ${i.suggestion} *(${i.reason})*`)
              .join("\n")
          : "No issues found.";
      const verdict = result.hasBias ? "⚠️ Issues found" : "✅ Looks inclusive";
      return `**Bias Check:** ${verdict} (score: ${result.score}/100)\n\n${issueList}`;
    }

    default:
      return "I couldn't execute that action.";
  }
}
