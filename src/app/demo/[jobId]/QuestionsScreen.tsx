"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Mic } from "lucide-react";
import type { DemoJob, Question } from "@/components/home/demo-data";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const TYPE_LABEL: Record<Question["type"], string> = {
  mc: "Multiple Choice",
  open: "Open Response",
  style: "Operating Style",
};

export function QuestionsScreen({
  job,
  questions,
  currentQIndex,
  answers,
  timeLeft,
  integrityCount,
  dictating,
  onAnswer,
  onPaste,
  onDictate,
  onPrev,
  onNext,
  onSubmit,
  toastMsg,
}: {
  job: DemoJob;
  questions: Question[];
  currentQIndex: number;
  answers: Record<string, number | string>;
  timeLeft: number;
  integrityCount: number;
  dictating: boolean;
  onAnswer: (questionId: string, value: number | string) => void;
  onPaste: (questionId: string) => void;
  onDictate: (questionId: string, transcript: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  toastMsg: string | null;
}) {
  const currentQ = questions[currentQIndex];
  const progress = ((currentQIndex + 1) / questions.length) * 100;
  const canAdvance = answers[currentQ.id] !== undefined || dictating;
  const isLast = currentQIndex === questions.length - 1;

  const timerColor =
    timeLeft > 300 ? "text-slate-500"
    : timeLeft >= 120 ? "text-amber-600"
    : "text-red-600 animate-pulse";

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 max-w-xs rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 shrink-0 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Signal</span>
          </Link>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <span className="font-semibold text-slate-700 text-sm truncate flex-1">{job.title}</span>
          <span className="text-xs text-slate-400 shrink-0">
            Q {currentQIndex + 1} / {questions.length}
          </span>
          <span className={`text-sm font-mono font-bold shrink-0 ${timerColor}`}>
            <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            {formatTime(timeLeft)}
          </span>
          {integrityCount > 0 && (
            <span className="text-xs text-amber-600 font-semibold shrink-0">
              🔍 {integrityCount}
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        {/* Type badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border ${
            currentQ.type === "mc"
              ? "bg-blue-50 text-blue-700 border-blue-100"
              : currentQ.type === "open"
              ? "bg-purple-50 text-purple-700 border-purple-100"
              : "bg-amber-50 text-amber-700 border-amber-100"
          }`}
        >
          {TYPE_LABEL[currentQ.type]}
        </div>

        {/* Question text */}
        <h2 className="font-heading font-bold text-xl md:text-2xl text-slate-900 mb-6 leading-snug">
          {currentQ.text}
        </h2>

        {/* Answer area */}
        {currentQ.type === "mc" || currentQ.type === "style" ? (
          <div className="space-y-3">
            {currentQ.options?.map((opt, idx) => {
              const selected = answers[currentQ.id] === idx;
              return (
                <button
                  key={opt.label}
                  onClick={() => onAnswer(currentQ.id, idx)}
                  className={`w-full text-left flex items-start gap-3 rounded-xl border p-4 transition-all ${
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      selected
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[160px] rounded-xl border border-slate-200 p-4 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 resize-y"
              placeholder="Type your response here…"
              value={(answers[currentQ.id] as string) ?? ""}
              onChange={(e) => onAnswer(currentQ.id, e.target.value)}
              onPaste={() => onPaste(currentQ.id)}
            />
            {currentQ.dictationTranscript && (
              <button
                onClick={() => onDictate(currentQ.id, currentQ.dictationTranscript!)}
                disabled={dictating}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                <Mic className="h-3.5 w-3.5" />
                {dictating ? "Transcribing…" : "Use mic (demo)"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 border-t border-slate-100 bg-white">
        <div className="container mx-auto max-w-2xl px-4 py-4 flex items-center justify-between gap-4">
          <button
            onClick={onPrev}
            disabled={currentQIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {isLast ? (
            <button
              onClick={onSubmit}
              disabled={!canAdvance}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-40 transition-all active:scale-95"
            >
              Submit
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canAdvance}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-40 transition-all active:scale-95"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
