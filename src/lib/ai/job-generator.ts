import { proModel, flashModel, generateJSON, generateText } from "./gemini";

export interface GeneratedJobDescription {
  description: string;
  requirements: string;
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export async function generateJobDescription(
  title: string,
  context?: string
): Promise<GeneratedJobDescription> {
  return generateJSON<GeneratedJobDescription>(
    proModel,
    `Write a compelling job description for the following role.

    Job Title: ${title}
    ${context ? `Additional Context: ${context}` : ""}

    Return JSON with:
    - description (string: 3-4 paragraphs about the role, team, and impact)
    - requirements (string: bullet-point list of required and preferred qualifications)
    - skills (array of strings: 5-10 key skills required for this role, e.g. "React", "TypeScript", "Node.js")
    - salaryRange (object with min, max as annual numbers and currency as a string e.g. "USD", based on current market data for this title${context ? ` in ${context}` : ""})`
  );
}

export interface BiasCheckResult {
  hasBias: boolean;
  issues: Array<{
    text: string;
    suggestion: string;
    reason: string;
  }>;
  score: number;
}

export async function checkJobBias(
  jobText: string
): Promise<BiasCheckResult> {
  return generateJSON<BiasCheckResult>(
    flashModel,
    `Analyze this job description for potentially biased, exclusionary, or unclear language.
    Look for gender-coded words, age bias, unnecessary requirements, and unclear jargon.

    Job text:
    ${jobText}

    Return JSON with:
    - hasBias (boolean)
    - issues (array of {text: problematic phrase, suggestion: better alternative, reason: why it's an issue})
    - score (number 0-100, where 100 is completely inclusive)`
  );
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  notes: string;
}

export async function suggestSalaryRange(
  title: string,
  location: string,
  seniority: string
): Promise<SalaryRange> {
  return generateJSON<SalaryRange>(
    proModel,
    `Suggest a competitive salary range for this role based on current market data.

    Title: ${title}
    Location: ${location}
    Seniority: ${seniority}

    Return JSON with:
    - min (number, annual salary minimum in local currency)
    - max (number, annual salary maximum)
    - currency (string, e.g. "USD")
    - notes (string, brief context about the range)`
  );
}

export async function generateScreeningQuestions(
  jobTitle: string,
  requirements: string
): Promise<string[]> {
  return generateJSON<string[]>(
    proModel,
    `Generate 5-7 screening questions for candidates applying for this role.
    Questions should help quickly assess fit and weed out unqualified candidates.
    Mix of yes/no and short-answer questions.

    Job Title: ${jobTitle}
    Requirements: ${requirements}

    Return a JSON array of question strings.`
  );
}

export async function generateInterviewQuestions(
  jobTitle: string,
  candidateBackground: string
): Promise<{ behavioral: string[]; technical: string[]; culture: string[] }> {
  return generateJSON(
    proModel,
    `Generate interview questions tailored to this specific candidate for this role.

    Job Title: ${jobTitle}
    Candidate Background: ${candidateBackground}

    Return JSON with:
    - behavioral (array of 3-4 behavioral questions using STAR format prompts)
    - technical (array of 3-4 role-specific technical questions)
    - culture (array of 2-3 culture fit questions)`
  );
}

export async function generateOfferLetter(params: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  salary: string;
  startDate: string;
  additionalTerms?: string;
}): Promise<string> {
  return generateText(
    proModel,
    `Write a professional job offer letter with the following details:

    Candidate: ${params.candidateName}
    Role: ${params.jobTitle}
    Company: ${params.companyName}
    Compensation: ${params.salary}
    Start Date: ${params.startDate}
    ${params.additionalTerms ? `Additional Terms: ${params.additionalTerms}` : ""}

    Include: warm opening, role details, compensation, benefits mention placeholder, start date, acceptance deadline, and professional closing.`
  );
}

export async function analyzeSkillsGap(
  candidateSkills: string,
  jobRequirements: string
): Promise<{
  matched: string[];
  missing: string[];
  partial: string[];
  developmentPlan: string;
}> {
  return generateJSON(
    proModel,
    `Perform a detailed skills gap analysis between this candidate and the job requirements.

    Candidate Skills & Experience:
    ${candidateSkills}

    Job Requirements:
    ${jobRequirements}

    Return JSON with:
    - matched (array of skills the candidate has that are required)
    - missing (array of required skills the candidate lacks)
    - partial (array of skills where candidate has some but not full proficiency)
    - developmentPlan (string: 2-3 sentences on how candidate could close the gaps)`
  );
}

export async function detectDuplicateCandidate(
  candidate1: string,
  candidate2: string
): Promise<{ isDuplicate: boolean; confidence: number; reason: string }> {
  return generateJSON(
    flashModel,
    `Determine if these two candidate profiles represent the same person.

    Profile 1:
    ${candidate1}

    Profile 2:
    ${candidate2}

    Return JSON with:
    - isDuplicate (boolean)
    - confidence (number 0-100)
    - reason (string explaining the determination)`
  );
}

export async function analyzePipelineInsights(pipelineData: string): Promise<{
  bottlenecks: string[];
  conversionRates: Record<string, number>;
  recommendations: string[];
}> {
  return generateJSON(
    proModel,
    `Analyze this hiring pipeline data and identify bottlenecks and inefficiencies.

    Pipeline Data:
    ${pipelineData}

    Return JSON with:
    - bottlenecks (array of identified bottleneck descriptions)
    - conversionRates (object mapping stage names to conversion percentages)
    - recommendations (array of 3-5 actionable recommendations)`
  );
}

export async function generateReferenceQuestions(
  jobTitle: string,
  candidateBackground: string
): Promise<string[]> {
  return generateJSON<string[]>(
    proModel,
    `Generate 6-8 reference check questions for this candidate applying for the given role.
    Focus on work style, accomplishments, and potential areas of concern.

    Job Title: ${jobTitle}
    Candidate Background: ${candidateBackground}

    Return a JSON array of question strings.`
  );
}

export async function tagCandidate(
  candidateProfile: string
): Promise<string[]> {
  return generateJSON<string[]>(
    flashModel,
    `Extract relevant tags for this candidate profile.
    Tags should include: skills, domain expertise, seniority level, and notable characteristics.
    Keep tags concise (1-3 words each).

    Candidate Profile:
    ${candidateProfile}

    Return a JSON array of tag strings (max 10 tags).`
  );
}
