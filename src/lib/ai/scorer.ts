import { flashModel, generateJSON } from "./gemini";

export interface ScoringResult {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export async function scoreCandidate(
  candidateProfile: string,
  jobDescription: string,
  jobRequirements: string
): Promise<ScoringResult> {
  return generateJSON<ScoringResult>(
    flashModel,
    `Score this candidate against the job requirements on a scale of 0-100.

    Job Title and Description:
    ${jobDescription}

    Job Requirements:
    ${jobRequirements}

    Candidate Profile:
    ${candidateProfile}

    Return JSON with:
    - score (number 0-100)
    - strengths (array of 3-5 key strengths relevant to this role)
    - gaps (array of 2-4 missing skills or experience)
    - recommendation (one sentence summary)`
  );
}
