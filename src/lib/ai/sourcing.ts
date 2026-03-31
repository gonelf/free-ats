import { flashModel, generateJSON } from "./gemini";

export interface SourceCriteria {
  roles: string[];
  skills: string[];
  locations: string[];
  experienceLevel: string;
  minTenureYears?: number;
  industries?: string[];
  notes?: string;
}

export interface CandidateMatch {
  candidateId: string;
  matchScore: number; // 0-100
  matchReason: string; // 1-2 sentence explanation
  matchedSkills: string[];
  gaps: string[];
}

export async function parseNaturalLanguageQuery(query: string): Promise<SourceCriteria> {
  return generateJSON<SourceCriteria>(
    flashModel,
    `Parse this recruiting search query into structured search criteria.

Query: "${query}"

Return JSON with:
- roles: array of job title keywords/variants to match (e.g. ["backend engineer", "backend developer", "software engineer"])
- skills: array of relevant skills/technologies (e.g. ["Python", "Django", "PostgreSQL"])
- locations: array of location strings (e.g. ["EU", "Europe", "Berlin", "Remote"])
- experienceLevel: "entry" | "mid" | "senior" | "lead" | "any"
- minTenureYears: minimum years at previous companies (number, optional — only if explicitly mentioned)
- industries: array of industry keywords (e.g. ["SaaS", "fintech"]) — optional
- notes: any other relevant context from the query — optional

Be generous with synonyms and variants.`
  );
}

export async function scoreCandidateForSourcing(
  criteria: SourceCriteria,
  candidateProfile: {
    id: string;
    name: string;
    summary: string | null;
    tags: string[];
    workExperience: Array<{ title: string; company: string; startDate: string; endDate: string; description: string }>;
  }
): Promise<CandidateMatch> {
  const experience = candidateProfile.workExperience
    .map((e) => `${e.title} at ${e.company} (${e.startDate}–${e.endDate})`)
    .join(", ");

  const profile = [
    `Name: ${candidateProfile.name}`,
    candidateProfile.summary ? `Summary: ${candidateProfile.summary}` : "",
    candidateProfile.tags.length ? `Skills: ${candidateProfile.tags.join(", ")}` : "",
    experience ? `Experience: ${experience}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generateJSON<{ matchScore: number; matchReason: string; matchedSkills: string[]; gaps: string[] }>(
    flashModel,
    `Score this candidate against sourcing criteria.

Criteria:
- Target roles: ${criteria.roles.join(", ")}
- Required skills: ${criteria.skills.join(", ")}
- Location preference: ${criteria.locations.join(", ") || "any"}
- Experience level: ${criteria.experienceLevel}
${criteria.minTenureYears ? `- Min tenure: ${criteria.minTenureYears}+ years per role` : ""}
${criteria.industries?.length ? `- Industries: ${criteria.industries.join(", ")}` : ""}

Candidate:
${profile}

Return JSON with:
- matchScore: 0-100 (how well they match the sourcing criteria)
- matchReason: 1-2 sentence summary of why they're a match (or not)
- matchedSkills: array of skills/criteria they clearly match
- gaps: array of things they're missing from the criteria`
  );

  return { candidateId: candidateProfile.id, ...result };
}
