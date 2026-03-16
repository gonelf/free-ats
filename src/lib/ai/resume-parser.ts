import { flashModel, generateJSON } from "./gemini";
import { Part } from "@google/generative-ai";

export interface ParsedResume {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  summary: string;
  skills: string[];
  achievements: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

const EXTRACTION_FIELDS = `
- firstName (string)
- lastName (string)
- email (string)
- phone (string)
- linkedinUrl (string, empty string if not found)
- summary (string, the candidate's own professional summary or objective from the resume)
- skills (array of strings, technical and soft skills)
- achievements (array of strings, each a notable accomplishment, award, or quantified result — e.g. "Reduced deploy time by 40%")
- experience (array of {title, company, startDate, endDate, description})
- education (array of {degree, institution, year})`;

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  return generateJSON<ParsedResume>(
    flashModel,
    `Extract structured information from this resume text. Return a JSON object with these fields:
${EXTRACTION_FIELDS}

Resume text:
${resumeText}`
  );
}

export async function parseResumeFromPdf(pdfBase64: string): Promise<ParsedResume> {
  const parts: Part[] = [
    { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
    {
      text: `Extract structured information from this resume. Return a JSON object with these fields:
${EXTRACTION_FIELDS}

Respond with valid JSON only, no markdown, no explanation.`,
    },
  ];
  const result = await flashModel.generateContent(parts);
  const text = result.response.text().trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return JSON.parse(fenceMatch[1].trim()) as ParsedResume;

  const objectMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objectMatch) return JSON.parse(objectMatch[1]) as ParsedResume;

  return JSON.parse(text) as ParsedResume;
}
