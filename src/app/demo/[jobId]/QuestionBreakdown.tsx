import type { Question } from "@/components/home/demo-data";

export function QuestionBreakdown({
  questions,
  answers,
}: {
  questions: Question[];
  answers: Record<string, number | string>;
}) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const answered = answers[q.id];
        let status: "correct" | "partial" | "wrong" | "auto" = "wrong";
        if (q.type === "open") {
          status = "auto";
        } else if (q.type === "mc") {
          status = answered === q.correctIndex ? "correct" : "wrong";
        } else if (q.type === "style") {
          status =
            answered === q.correctIndex
              ? "correct"
              : answered !== undefined
              ? "partial"
              : "wrong";
        }

        const statusColor =
          status === "correct"
            ? "text-teal-600 bg-teal-50 border-teal-200"
            : status === "auto"
            ? "text-blue-600 bg-blue-50 border-blue-200"
            : status === "partial"
            ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-red-500 bg-red-50 border-red-200";

        const statusLabel =
          status === "correct"
            ? "Correct"
            : status === "auto"
            ? "AI Reviewed"
            : status === "partial"
            ? "Partial"
            : "Incorrect";

        const points =
          status === "correct" ? 8 : status === "auto" ? 6 : status === "partial" ? 3 : 0;

        const typeLabel =
          q.type === "mc"
            ? "Multiple choice"
            : q.type === "open"
            ? "Open response"
            : "Operating style";

        return (
          <div key={q.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 line-clamp-2">{q.text}</p>
              <p className="mt-1 text-xs text-slate-400">{typeLabel}</p>
            </div>
            <div
              className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-semibold ${statusColor}`}
            >
              {statusLabel} · {points}pt
            </div>
          </div>
        );
      })}
    </div>
  );
}
