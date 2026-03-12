import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// Fast model for high-volume, cost-sensitive tasks
export const flashModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// Higher quality model for complex generation tasks
export const proModel = genAI.getGenerativeModel({
  model: "gemini-2.0-pro-exp",
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
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned) as T;
}
