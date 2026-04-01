/**
 * AI Credit System
 *
 * Credits are an abstract usage unit calibrated so that 2,500 credits ≈ $25
 * of Gemini API spend (100 credits = ~$1 at Gemini Flash pricing).
 *
 * Free workspaces: 100 one-time trial credits (no reset).
 * Pro workspaces:  2,500 credits, resets monthly.
 */

/** One-time trial allowance for Free plan workspaces. */
export const FREE_TRIAL_CREDITS = 100;

/** Monthly allowance for Pro plan workspaces. */
export const MONTHLY_CREDITS = 2500;

/**
 * Credit cost per AI feature.
 * Costs reflect relative token usage and output length.
 *
 * Gemini 2.0 Flash: $0.075/1M input tokens, $0.30/1M output tokens.
 * At 100 credits = ~$1:
 *   - 1 credit ≈ $0.01
 *   - A call using ~5K input + ~1K output ≈ $0.0007 ≈ ~1 credit minimum
 *   - Heavier calls (resume parsing, offer letters) scale to 10 credits
 */
export const AI_CREDIT_COSTS = {
  // Heavy — long input + long output
  "parse-resume": 10,       // full resume text → structured profile
  "generate-offer": 10,     // detailed offer letter generation
  "pipeline-insights": 10,  // aggregate analytics across all pipeline data

  // Medium-heavy — significant output
  "generate-job-description": 8, // long-form JD from a short brief

  // Medium — one or two paragraphs of output
  "score-candidate": 5,     // numeric score + rationale
  "generate-summary": 5,    // 200-word candidate summary
  "draft-email": 5,         // personalized outreach / rejection / offer email
  "suggest-questions": 5,   // 8-10 tailored interview questions
  "skills-gap": 5,          // comparative skills analysis

  // Light — short structured output
  "extract-requirements": 3,   // bullet-list extraction from notes
  "check-job-bias": 3,         // bias flags with explanations
  "suggest-salary": 3,         // salary range with rationale
  "detect-duplicate": 3,       // similarity match result
  "reference-questions": 3,    // 5-6 reference check questions

  // Very light
  "tag-candidate": 2,          // array of tags only
} as const;

export type AiFeature = keyof typeof AI_CREDIT_COSTS;
