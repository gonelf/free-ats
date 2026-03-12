import { flashModel, generateJSON } from "./gemini";

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
