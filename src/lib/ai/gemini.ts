import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// Fast model for high-volume, cost-sensitive tasks
export const flashModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Higher quality model for complex generation tasks
export const proModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function generateText(
  model: typeof flashModel,
  prompt: string
): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateJSON<T>(
  model: typeof flashModel,
  prompt: string
): Promise<T> {
  const result = await model.generateContent(
    `${prompt}\n\nRespond with valid JSON only, no markdown, no explanation.`
  );
  const text = result.response.text().trim();

  // 1. Try to extract from a ```json ... ``` or ``` ... ``` code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim()) as T;
  }

  // 2. Try to extract the first {...} or [...] block (handles thinking-model preamble)
  const objectMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objectMatch) {
    return JSON.parse(objectMatch[1]) as T;
  }

  // 3. Fall back to parsing the full text as-is
  return JSON.parse(text) as T;
}
