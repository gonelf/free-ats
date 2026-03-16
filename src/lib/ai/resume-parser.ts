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

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  return generateJSON<ParsedResume>(
    flashModel,
    `Extract structured information from this resume text. Return a JSON object with these fields:
    - firstName (string)
    - lastName (string)
    - email (string)
    - phone (string)
    - linkedinUrl (string, empty string if not found)
    - summary (string, brief professional summary)
    - skills (array of strings)
    - experience (array of {title, company, startDate, endDate, description})
    - education (array of {degree, institution, year})

    Resume text:
    ${resumeText}`
  );
}

const PARSE_RESUME_PROMPT = `Extract structured information from this resume. Return a JSON object with these fields:
- firstName (string)
- lastName (string)
- email (string)
- phone (string)
- linkedinUrl (string, empty string if not found)
- summary (string, brief professional summary)
- skills (array of strings)
- experience (array of {title, company, startDate, endDate, description})
- education (array of {degree, institution, year})

Respond with valid JSON only, no markdown, no explanation.`;

export async function parseResumeFromPdf(pdfBase64: string): Promise<ParsedResume> {
  const parts: Part[] = [
    { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
    { text: PARSE_RESUME_PROMPT },
  ];
  const result = await flashModel.generateContent(parts);
  const text = result.response.text().trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return JSON.parse(fenceMatch[1].trim()) as ParsedResume;

  const objectMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objectMatch) return JSON.parse(objectMatch[1]) as ParsedResume;

  return JSON.parse(text) as ParsedResume;
}
