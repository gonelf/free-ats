import { flashModel, generateText } from "./gemini";

export async function generateCandidateSummary(
  candidateProfile: string
): Promise<string> {
  return generateText(
    flashModel,
    `Write a concise 3-4 sentence professional summary of this candidate for a recruiter's review.
    Highlight their most relevant experience, key skills, and career trajectory. Be factual and objective.

    Candidate profile:
    ${candidateProfile}`
  );
}
