"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ScreeningQuestion {
  id: string;
  question: string;
  type: string;
}

interface ScreeningClientProps {
  applicationId: string;
  candidateName: string;
  questions: ScreeningQuestion[];
  totalQuestions: number;
  answeredCount: number;
}

export function ScreeningClient({
  applicationId,
  candidateName,
  questions: initialQuestions,
  totalQuestions,
  answeredCount: initialAnsweredCount,
}: ScreeningClientProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(initialAnsweredCount);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [done, setDone] = useState(initialQuestions.length === 0);
  const [error, setError] = useState("");

  const current = questions[currentIdx];
  const progress = Math.round(((answeredCount + currentIdx) / totalQuestions) * 100);

  async function handleSubmit() {
    if (!answer.trim() || !current) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/screening/${applicationId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: current.id, answer: answer.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit answer. Please try again.");
        return;
      }

      setAnsweredCount((c) => c + 1);
      setAnswer("");

      if (data.allAnswered) {
        setDone(true);
        return;
      }

      if (data.followUpQuestion) {
        // Insert follow-up question at the next position
        const followUpQ: ScreeningQuestion = {
          id: `followup-${current.id}`,
          question: data.followUpQuestion,
          type: "followup",
        };
        setQuestions((qs) => [
          ...qs.slice(0, currentIdx + 1),
          followUpQ,
          ...qs.slice(currentIdx + 1),
        ]);
        setFollowUp(data.followUpQuestion);
      } else {
        setFollowUp(null);
      }

      setCurrentIdx((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
          Screening Complete
        </h2>
        <p className="text-sm text-green-700 dark:text-green-400 mt-2">
          Thank you, {candidateName}. Your responses have been submitted successfully.
          The hiring team will review your application and be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {answeredCount + currentIdx + 1} of {totalQuestions + (followUp ? 1 : 0)}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      {current && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-8">
          {current.type === "followup" && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-3">
              Follow-up
            </p>
          )}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-relaxed mb-6">
            {current.question}
          </h2>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer…"
            rows={6}
            className="text-sm resize-none"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Take your time — there are no right or wrong answers.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              size="sm"
            >
              {submitting ? "Submitting…" : "Next →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
