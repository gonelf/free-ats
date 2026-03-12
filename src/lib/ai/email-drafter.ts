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
