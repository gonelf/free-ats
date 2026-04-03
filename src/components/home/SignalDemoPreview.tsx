"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Shield, AlertTriangle, ChevronRight, BarChart3 } from "lucide-react";

type Stage = "job-select" | "question" | "candidate" | "manager";

const STAGES: Stage[] = ["job-select", "question", "candidate", "manager"];
const STAGE_DURATIONS: Record<Stage, number> = {
  "job-select": 3000,
  "question": 3800,
  "candidate": 3800,
  "manager": 3200,
};

const STAGE_LABELS: Record<Stage, string> = {
  "job-select": "Pick a Role",
  "question": "Live Assessment",
  "candidate": "Candidate Report",
  "manager": "Hiring Manager View",
};

/* ─── Stage 1: Job selection ─────────────────────────────── */
function JobSelectStage() {
  const jobs = [
    { id: "fe", icon: "⚡", title: "Frontend Engineer", active: true },
    { id: "pm", icon: "🧭", title: "Product Manager", active: false },
    { id: "cs", icon: "🤝", title: "Customer Success", active: false },
    { id: "sdr", icon: "📞", title: "Sales Dev Rep", active: false },
    { id: "da", icon: "📊", title: "Data Analyst", active: false },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
          Signal · Micro-Audition
        </div>
        <div className="text-sm font-bold text-slate-900">Choose your role to assess</div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`rounded-lg border px-3 py-2.5 transition-all ${
              job.active
                ? "border-teal-400 bg-teal-50"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            <div className="text-lg mb-1">{job.icon}</div>
            <div className={`text-[11px] font-semibold leading-tight ${job.active ? "text-teal-800" : "text-slate-600"}`}>
              {job.title}
            </div>
            {job.active && (
              <div className="text-[10px] text-teal-500 font-medium mt-0.5 flex items-center gap-0.5">
                Selected <ChevronRight className="h-2.5 w-2.5" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center text-[10px] text-slate-400 font-medium">
        4 questions · ~3 min · No resume needed
      </div>
    </div>
  );
}

/* ─── Stage 2: Live question ─────────────────────────────── */
function QuestionStage() {
  return (
    <div>
      {/* Integrity bar */}
      <div className="flex items-center gap-1.5 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-[10px] font-medium text-amber-700">
        <BarChart3 className="h-3 w-3 shrink-0" />
        Live session — typing patterns are monitored
      </div>

      <div className="p-4">
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${i < 3 ? "w-5 bg-teal-500" : "w-4 bg-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">4 of 4</span>
        </div>

        {/* Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            Operating Style
          </span>
        </div>

        {/* Question */}
        <p className="text-xs font-medium text-slate-900 mb-3 leading-relaxed">
          Product vision vs. a pressing customer request — you can only ship one this quarter. You:
        </p>

        {/* Options */}
        <div className="space-y-1.5 mb-4">
          {[
            { label: "A", text: "Always prioritize vision", selected: false },
            { label: "B", text: "Always prioritize the customer", selected: false },
            { label: "C", text: "Evaluate strategic value vs vision alignment", selected: true },
            { label: "D", text: "Bring it to the CEO to decide", selected: false },
          ].map((opt) => (
            <div
              key={opt.label}
              className={`rounded-lg border px-3 py-2 text-[11px] transition-all ${
                opt.selected
                  ? "border-teal-400 bg-teal-50 text-teal-900 font-medium"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <span className={`font-bold mr-1.5 ${opt.selected ? "text-teal-600" : "text-slate-400"}`}>
                {opt.label}.
              </span>
              {opt.text}
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-700 py-2 text-xs font-bold text-white">
          Submit
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

/* ─── Stage 3: Candidate results ────────────────────────── */
function CandidateResultsStage() {
  return (
    <div className="p-4">
      {/* Tab bar */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 mb-4 gap-0.5">
        <div className="flex-1 rounded-md py-1.5 text-[10px] font-semibold text-center bg-white text-slate-900 shadow-sm">
          Your Results
        </div>
        <div className="flex-1 rounded-md py-1.5 text-[10px] font-semibold text-center text-slate-400">
          Hiring Manager View
        </div>
      </div>

      {/* Score + badges */}
      <div className="flex items-center gap-4 mb-4">
        {/* Mini score ring */}
        <div className="relative shrink-0 flex items-center justify-center w-14 h-14">
          <svg width="56" height="56" className="-rotate-90">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
            <circle
              cx="28" cy="28" r="22" fill="none" stroke="#0d9488" strokeWidth="5"
              strokeDasharray={138.2}
              strokeDashoffset={138.2 * 0.18}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-sm font-black text-slate-900 leading-none">82</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-800">
            <Check className="h-3 w-3 shrink-0" />
            You'd advance to the next round
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            <Shield className="h-3 w-3" />
            Integrity: High
          </div>
          <div className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
            Style: Strategic &amp; Balanced
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
        Question Breakdown
      </div>
      <div className="space-y-1.5">
        {[
          { q: "A/B test: p=0.04, 1.2% lift in conversion. You:", correct: true, type: "mc", answer: "B. Weigh lift vs. implementation cost" },
          { q: "A feature has 2% adoption after 3 months.", correct: null, type: "open", answer: "Reviewed by AI" },
          { q: "Product vision vs. pressing customer request.", correct: true, type: "style", answer: "C. Evaluate strategic value" },
          { q: "Sales requests features outside roadmap.", correct: false, type: "mc", answer: "A → Better: B. Meet to understand root need" },
        ].map((row, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] text-slate-600 leading-snug line-clamp-1">
                <span className="font-semibold text-slate-400 mr-1">Q{i + 1}.</span>
                {row.q}
              </p>
              {row.type === "open" ? (
                <span className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[9px] font-semibold text-teal-700 whitespace-nowrap">
                  AI reviewed
                </span>
              ) : (
                <span className={`shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${row.correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {row.correct ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                </span>
              )}
            </div>
            <div className={`text-[10px] mt-0.5 ${row.correct === false ? "text-red-600" : "text-slate-400"}`}>
              {row.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stage 4: Hiring manager view ──────────────────────── */
function ManagerViewStage() {
  return (
    <div className="p-4">
      {/* Tab bar */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 mb-4 gap-0.5">
        <div className="flex-1 rounded-md py-1.5 text-[10px] font-semibold text-center text-slate-400">
          Your Results
        </div>
        <div className="flex-1 rounded-md py-1.5 text-[10px] font-semibold text-center bg-white text-slate-900 shadow-sm">
          Hiring Manager View
        </div>
      </div>

      {/* Candidate card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
            CD
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Demo Candidate</div>
            <div className="text-[10px] text-slate-500">Product Manager Assessment</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Score", value: "82", color: "text-teal-700" },
            { label: "Integrity", value: "High", color: "text-green-700" },
            { label: "Style", value: "Strategic", color: "text-purple-700" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center">
              <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{item.label}</div>
              <div className={`text-xs font-black ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit trail */}
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
        Show Proof — Audit Trail
      </div>
      <div className="space-y-1.5 mb-3">
        {/* Expanded row */}
        <div className="rounded-lg border border-teal-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-2">
            <span className="h-3.5 w-3.5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check className="h-2 w-2 text-green-600" />
            </span>
            <span className="text-[10px] text-slate-700 font-medium flex-1">Q1: A/B test with 1.2% lift...</span>
            <ChevronRight className="h-3 w-3 text-teal-400 rotate-90" />
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-2.5 py-2">
            <div className="text-[9px] text-slate-400 font-medium mb-0.5">Candidate&apos;s answer:</div>
            <p className="text-[10px] text-slate-700 leading-relaxed">
              B. Weigh the lift against implementation cost and consider long-term compounding before deciding.
            </p>
          </div>
        </div>
        {/* Collapsed row */}
        <div className="rounded-lg border border-slate-200 bg-white flex items-center gap-2 px-2.5 py-2">
          <span className="h-3.5 w-3.5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <span className="text-[8px] text-teal-600 font-bold">AI</span>
          </span>
          <span className="text-[10px] text-slate-700 font-medium flex-1">Q2: 2% feature adoption...</span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-teal-700 py-2 text-[10px] font-bold text-white">
          <Check className="h-3 w-3" />
          Approve
        </div>
        <div className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white py-2 text-[10px] font-bold text-red-600">
          <X className="h-3 w-3" />
          Archive
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export function SignalDemoPreview() {
  const [stageIndex, setStageIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
      setVisible(true);
    }, 350);
  }, []);

  useEffect(() => {
    if (paused) return;
    const stage = STAGES[stageIndex];
    const timer = setTimeout(advance, STAGE_DURATIONS[stage]);
    return () => clearTimeout(timer);
  }, [stageIndex, paused, advance]);

  const currentStage = STAGES[stageIndex];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stage content */}
      <div
        className="min-h-[340px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {currentStage === "job-select" && <JobSelectStage />}
        {currentStage === "question" && <QuestionStage />}
        {currentStage === "candidate" && <CandidateResultsStage />}
        {currentStage === "manager" && <ManagerViewStage />}
      </div>

      {/* Stage indicators + label */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50">
        <span className="text-[10px] text-slate-400 font-medium">{STAGE_LABELS[currentStage]}</span>
        <div className="flex gap-1.5">
          {STAGES.map((s, i) => (
            <button
              key={s}
              onClick={() => { setStageIndex(i); setVisible(true); }}
              className={`rounded-full transition-all duration-300 ${
                i === stageIndex ? "w-4 h-1.5 bg-teal-500" : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
