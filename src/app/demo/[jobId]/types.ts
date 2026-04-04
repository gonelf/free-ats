export type Phase = "intro" | "questions" | "results";

export type IntegrityEvent = {
  timeRemaining: string; // e.g. "7:42"
  questionNum: number;   // 1-based
  description: string;
  severity: "low" | "medium" | "high";
};
