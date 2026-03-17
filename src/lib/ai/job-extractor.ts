import { flashModel, generateJSON } from "./gemini";

export interface ExtractedJob {
  title: string;
  description: string;
  requirements: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  companyName: string;
  contactEmail: string | null;
}

export async function extractJobFromText(text: string): Promise<ExtractedJob> {
  return generateJSON<ExtractedJob>(
    flashModel,
    `Extract structured job posting information from the following text. This text may come from a LinkedIn post, tweet, Notion doc, or any other informal source.

Text:
${text}

Return JSON with:
- title (string: the job title/role being hired for)
- description (string: a summary of the role, responsibilities, and company — expand if the source is brief)
- requirements (string: qualifications, skills, and experience required — infer from context if not explicit)
- location (string or null: city/country/remote — null if not mentioned)
- salaryMin (number or null: annual minimum salary in local currency — null if not mentioned)
- salaryMax (number or null: annual maximum salary in local currency — null if not mentioned)
- companyName (string: the name of the hiring company)
- contactEmail (string or null: any email address found in the text for applications/contact — null if not found)`
  );
}
