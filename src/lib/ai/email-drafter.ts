import { proModel, generateText } from "./gemini";

export type EmailType =
  | "outreach"
  | "rejection"
  | "offer"
  | "interview_invite"
  | "follow_up";

export interface DraftEmailParams {
  type: EmailType;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  additionalContext?: string;
}

export interface DraftedEmail {
  subject: string;
  body: string;
}

export interface DraftRejectionParams {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export async function draftRejectionEmail(
  params: DraftRejectionParams
): Promise<DraftedEmail> {
  const strengthsText =
    params.strengths.length > 0
      ? `Candidate strengths: ${params.strengths.join("; ")}`
      : "";
  const gapsText =
    params.gaps.length > 0
      ? `Areas where they didn't fully match: ${params.gaps.join("; ")}`
      : "";

  const text = await generateText(
    proModel,
    `Write an empathetic, constructive rejection email for a job applicant.

Candidate Name: ${params.candidateName}
Job Title: ${params.jobTitle}
Company: ${params.companyName}
${strengthsText}
${gapsText}
${params.recommendation ? `Recruiter note: ${params.recommendation}` : ""}

Requirements:
- Be warm and genuinely appreciative of their time
- Briefly acknowledge 1-2 genuine strengths you noticed
- Explain the specific gap(s) that drove the decision, e.g. "We needed deeper X experience for this particular project"
- Leave them with a positive impression of the company
- Do NOT be vague — specificity makes the rejection useful to the candidate
- Keep it under 150 words

Format:
SUBJECT: [email subject line]
---
[email body]`
  );

  const parts = text.split("---");
  const subjectLine = parts[0].replace("SUBJECT:", "").trim();
  const body = parts.slice(1).join("---").trim();

  return { subject: subjectLine, body };
}

export async function draftEmail(
  params: DraftEmailParams
): Promise<DraftedEmail> {
  const typeDescriptions: Record<EmailType, string> = {
    outreach: "initial outreach to a potential candidate",
    rejection: "respectful rejection after reviewing their application",
    offer: "job offer letter",
    interview_invite: "invitation to schedule an interview",
    follow_up: "follow-up after an interview",
  };

  const text = await generateText(
    proModel,
    `Write a professional ${typeDescriptions[params.type]} email.

    Candidate Name: ${params.candidateName}
    Job Title: ${params.jobTitle}
    Company: ${params.companyName}
    ${params.additionalContext ? `Additional Context: ${params.additionalContext}` : ""}

    Format your response as:
    SUBJECT: [email subject line]
    ---
    [email body]

    Keep the tone professional yet warm. Be concise.`
  );

  const parts = text.split("---");
  const subjectLine = parts[0].replace("SUBJECT:", "").trim();
  const body = parts.slice(1).join("---").trim();

  return { subject: subjectLine, body };
}
