"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Check, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { DemoJob, Question } from "@/components/home/demo-data";
import type { IntegrityEvent } from "./types";
import { ScoreRing } from "./ScoreRing";
import { QuestionBreakdown } from "./QuestionBreakdown";
import { IntegrityLogTable } from "./IntegrityLogTable";

function integrityColor(label: "High" | "Medium" | "Low") {
  if (label === "High") return "text-green-600 bg-green-50 border-green-200";
  if (label === "Medium") return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-500 bg-red-50 border-red-200";
}

export function ResultsScreen({
  job,
  questions,
  answers,
  score,
  passed,
  integrityLabel,
  styleLabel,
  integrityLog,
  scoreAnimated,
  onToast,
}: {
  job: DemoJob;
  questions: Question[];
  answers: Record<string, number | string>;
  score: number;
  passed: boolean;
  integrityLabel: "High" | "Medium" | "Low";
  styleLabel: string;
  integrityLog: IntegrityEvent[];
  scoreAnimated: boolean;
  onToast: (msg: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"candidate" | "manager">("candidate");
  const [showProofIndex, setShowProofIndex] = useState<number | null>(null);

  const ic = integrityColor(integrityLabel);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white">
        <div className="container mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to demo
          </Link>
          <span className="text-sm font-semibold text-slate-400">Signal Assessment</span>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-black text-3xl text-slate-900 mb-1">Your Results</h1>
          <p className="text-slate-500">{job.title}</p>
        </div>

        {/* Tab bar */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 mb-8">
          {(["candidate", "manager"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "candidate" ? "Candidate Report" : "Hiring Manager View"}
            </button>
          ))}
        </div>

        {/* ── Candidate Report ── */}
        {activeTab === "candidate" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <ScoreRing score={score} animate={scoreAnimated} />
              <div
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold border ${
                  passed
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {passed ? "Passed" : "Not Passed"} · {score}/100
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${ic}`}>
                  <Shield className="h-3 w-3" />
                  Integrity: {integrityLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  {styleLabel}
                </span>
              </div>
            </div>

            <div>
              <h2 className="font-heading font-bold text-base text-slate-900 mb-3">
                Question Breakdown
              </h2>
              <QuestionBreakdown questions={questions} answers={answers} />
            </div>

            <div>
              <h2 className="font-heading font-bold text-base text-slate-900 mb-3">
                Integrity Log
              </h2>
              <IntegrityLogTable events={integrityLog} />
            </div>

            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6 text-center">
              <p className="font-heading font-bold text-slate-900 mb-1">
                Hire smarter, starting today
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Replace resumes with Signal assessments for every role you post.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-all active:scale-95"
              >
                Start hiring on proof →
              </Link>
            </div>
          </div>
        )}

        {/* ── Hiring Manager View ── */}
        {activeTab === "manager" && (
          <div className="space-y-6">
            {/* Candidate summary card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 shrink-0">
                  D
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-slate-900">Demo Candidate</p>
                  <p className="text-sm text-slate-500">{job.title} · Signal Assessment</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        passed
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}
                    >
                      Score: {score}/100
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ic}`}>
                      <Shield className="h-3 w-3" /> Integrity: {integrityLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                      {styleLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Show Proof audit trail */}
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900 mb-3">Show Proof</h2>
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const isOpen = showProofIndex === i;
                  const answered = answers[q.id];

                  let resultLabel = "No answer";
                  if (q.type === "open") {
                    resultLabel = answered ? "AI reviewed · 6 pts" : "No answer";
                  } else if (q.type === "mc") {
                    resultLabel =
                      answered === q.correctIndex
                        ? "Correct · 8 pts"
                        : answered !== undefined
                        ? "Incorrect · 0 pts"
                        : "No answer";
                  } else {
                    resultLabel =
                      answered === q.correctIndex
                        ? "Best fit · 8 pts"
                        : answered !== undefined
                        ? "Partial fit · 3 pts"
                        : "No answer";
                  }

                  return (
                    <div key={q.id} className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setShowProofIndex(isOpen ? null : i)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-slate-700 truncate">{q.text}</span>
                        <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                          {resultLabel}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 text-sm text-slate-600">
                          {q.type === "open" ? (
                            answered ? (
                              <p>{answered as string}</p>
                            ) : (
                              <p className="text-slate-400 italic">No response provided.</p>
                            )
                          ) : (
                            <div className="space-y-1">
                              {q.options?.map((opt, idx) => (
                                <div
                                  key={opt.label}
                                  className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs ${
                                    idx === q.correctIndex
                                      ? "bg-teal-50 text-teal-700"
                                      : idx === answered
                                      ? "bg-red-50 text-red-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  <span className="font-bold shrink-0">{opt.label}.</span>
                                  <span>{opt.text}</span>
                                  {idx === q.correctIndex && (
                                    <Check className="h-3.5 w-3.5 shrink-0 ml-auto" />
                                  )}
                                  {idx === answered && idx !== q.correctIndex && (
                                    <X className="h-3.5 w-3.5 shrink-0 ml-auto" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Dynamics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-heading font-bold text-base text-slate-900 mb-4">
                Team Dynamics
              </h2>
              <div className="space-y-3">
                <div className="rounded-xl bg-teal-50 border border-teal-100 p-3">
                  <p className="text-xs font-semibold text-teal-700 mb-1">Complementary strengths</p>
                  <p className="text-sm text-teal-800">
                    This candidate&apos;s <strong>{styleLabel}</strong> working style pairs well with
                    directive or visionary leads who benefit from a grounded, execution-focused
                    collaborator.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Potential friction
                  </p>
                  <p className="text-sm text-amber-800">
                    May conflict with highly process-driven teammates who prioritise consensus over
                    speed.{" "}
                    <span className="italic">
                      (Illustrative — based on style signal only.)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onToast("Sign up to use real hiring workflows →")}
                className="flex-1 rounded-xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-all active:scale-95"
              >
                Approve
              </button>
              <button
                onClick={() => onToast("Sign up to use real hiring workflows →")}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                Archive
              </button>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6 text-center">
              <p className="font-heading font-bold text-slate-900 mb-1">Build this pipeline for real</p>
              <p className="text-sm text-slate-500 mb-4">
                Post a role, collect Signal assessments, and shortlist your top 3 in 72 hours.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-all active:scale-95"
              >
                Build this pipeline →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
