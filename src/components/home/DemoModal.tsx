"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  ArrowRight,
  ChevronRight,
  Check,
  X,
  Shield,
  ShieldAlert,
  ShieldOff,
  AlertTriangle,
  BarChart3,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  demoJobs,
  getRandomizedQuestions,
  type DemoJob,
  type Question,
} from "./demo-data";

/* ─── Types ──────────────────────────────────────────────── */
type Phase = "job-select" | "questions" | "results";
type ResultTab = "candidate" | "manager";
type IntegrityLevel = "High" | "Medium" | "Low";

type AnswerMap = Record<string, number | string>; // questionId → selectedIndex or text

/* ─── Scoring ────────────────────────────────────────────── */
function computeScore(questions: Question[], answers: AnswerMap): number {
  let total = 0;
  for (const q of questions) {
    if (q.type === "open") {
      total += 20;
    } else if (q.type === "style") {
      const sel = answers[q.id];
      total += typeof sel === "number" && sel === q.correctIndex ? 25 : 10;
    } else {
      const sel = answers[q.id];
      total += typeof sel === "number" && sel === q.correctIndex ? 25 : 0;
    }
  }
  return Math.min(total, 100);
}

function getIntegrity(pasteCount: number): IntegrityLevel {
  if (pasteCount === 0) return "High";
  if (pasteCount === 1) return "Medium";
  return "Low";
}

function getStyleLabel(questions: Question[], answers: AnswerMap): string {
  const styleQ = questions.find((q) => q.type === "style");
  if (!styleQ || !styleQ.styleLabels) return "Results-Oriented";
  const sel = answers[styleQ.id];
  if (typeof sel === "number" && styleQ.styleLabels[sel]) {
    return styleQ.styleLabels[sel];
  }
  return styleQ.styleLabels[styleQ.correctIndex ?? 1] ?? "Results-Oriented";
}

/* ─── Toast ──────────────────────────────────────────────── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 shadow-md animate-in fade-in slide-in-from-top-2 duration-300 whitespace-nowrap">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </div>
  );
}

/* ─── Integrity badge ────────────────────────────────────── */
function IntegrityBadge({ level }: { level: IntegrityLevel }) {
  const cfg = {
    High: { icon: Shield, color: "text-green-700 bg-green-50 border-green-200" },
    Medium: { icon: ShieldAlert, color: "text-amber-700 bg-amber-50 border-amber-200" },
    Low: { icon: ShieldOff, color: "text-red-700 bg-red-50 border-red-200" },
  }[level];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
      <Icon className="h-3.5 w-3.5" />
      Integrity: {level}
    </span>
  );
}

/* ─── Circular score ring ────────────────────────────────── */
function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const r = (size / 2) * 0.78;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1000;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplayed(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const passColor = score >= 75 ? "#0d9488" : "#d97706";
  const dashOffset = circ - (displayed / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size * 0.09} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={passColor}
          strokeWidth={size * 0.09}
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-slate-900">{displayed}</span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">/ 100</span>
      </div>
    </div>
  );
}

/* ─── Screen 1: Job selection ────────────────────────────── */
function JobSelectScreen({ onSelect }: { onSelect: (job: DemoJob) => void }) {
  const icons: Record<string, string> = {
    "frontend-engineer": "⚡",
    "customer-success": "🤝",
    "product-manager": "🧭",
    "sales-dev-rep": "📞",
    "data-analyst": "📊",
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="font-heading font-bold text-xl text-slate-900 mb-1">Try a Micro-Audition</h2>
        <p className="text-sm text-slate-500">Pick a role — we'll run a 4-question skill assessment.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {demoJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => onSelect(job)}
            className="group text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-400 hover:bg-teal-50/40 transition-all duration-150 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-2xl">{icons[job.id]}</span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                ~3 min
              </span>
            </div>
            <div className="font-heading font-bold text-sm text-slate-900 mb-0.5">{job.title}</div>
            <div className="text-xs text-slate-500 leading-snug">{job.tagline}</div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Start assessment <ChevronRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Screen 2–5: Question ───────────────────────────────── */
function QuestionScreen({
  question,
  index,
  total,
  onAnswer,
  onPaste,
}: {
  question: Question;
  index: number;
  total: number;
  onAnswer: (value: number | string) => void;
  onPaste: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [dictating, setDictating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const typeLabel =
    question.type === "mc"
      ? "Multiple Choice"
      : question.type === "style"
      ? "Operating Style"
      : "Open Response";

  const typeBadgeColor =
    question.type === "mc"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : question.type === "style"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : "bg-teal-50 text-teal-700 border-teal-200";

  const canAdvance =
    question.type === "open"
      ? text.trim().length > 10
      : selected !== null;

  function handleNext() {
    if (!canAdvance) return;
    if (question.type === "open") {
      onAnswer(text.trim());
    } else {
      onAnswer(selected!);
    }
  }

  function handleDictate() {
    if (dictating || !question.dictationTranscript) return;
    setDictating(true);
    setTimeout(() => {
      setText(question.dictationTranscript!);
      setDictating(false);
      textareaRef.current?.focus();
    }, 1200);
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < index ? "w-6 bg-teal-500" : i === index ? "w-6 bg-teal-300" : "w-4 bg-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {index + 1} of {total}
        </span>
      </div>

      {/* Type badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${typeBadgeColor}`}>
          {typeLabel}
        </span>
      </div>

      {/* Question text */}
      <p className="text-sm font-medium text-slate-900 mb-5 leading-relaxed">{question.text}</p>

      {/* Answer area */}
      {question.type !== "open" ? (
        <div className="space-y-2">
          {question.options!.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all duration-100 ${
                selected === i
                  ? "border-teal-500 bg-teal-50 text-teal-900 font-medium"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`font-bold mr-2 ${selected === i ? "text-teal-600" : "text-slate-400"}`}>
                {opt.label}.
              </span>
              {opt.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={() => {
              onPaste();
            }}
            placeholder="Type your answer here, or use the dictation button…"
            rows={5}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 resize-none"
          />
          <button
            onClick={handleDictate}
            disabled={dictating}
            title="Simulate voice dictation"
            className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
              dictating
                ? "border-teal-200 bg-teal-50 text-teal-600 cursor-not-allowed"
                : "border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600"
            }`}
          >
            {dictating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Transcribing…
              </>
            ) : (
              <>
                <Mic className="h-3 w-3" />
                Dictate
              </>
            )}
          </button>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!canAdvance}
        className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
          canAdvance
            ? "bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {index === total - 1 ? "Submit" : "Next"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── Results screen ─────────────────────────────────────── */
function ResultsScreen({
  job,
  questions,
  answers,
  pasteCount,
}: {
  job: DemoJob;
  questions: Question[];
  answers: AnswerMap;
  pasteCount: number;
}) {
  const [activeTab, setActiveTab] = useState<ResultTab>("candidate");
  const [expandedProof, setExpandedProof] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const score = computeScore(questions, answers);
  const integrity = getIntegrity(pasteCount);
  const styleLabel = getStyleLabel(questions, answers);
  const passed = score >= 75;

  const tabs: { id: ResultTab; label: string }[] = [
    { id: "candidate", label: "Your Results" },
    { id: "manager", label: "Hiring Manager View" },
  ];

  function showDemoToast() {
    setToastMsg("This is a demo — sign up to use real workflows");
  }

  return (
    <div className="relative">
      {toastMsg && (
        <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
      )}

      {/* Tab bar */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 mb-6 gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Candidate Report ── */}
      {activeTab === "candidate" && (
        <div>
          {/* Score + badges row */}
          <div className="flex items-center gap-6 mb-5">
            <ScoreRing score={score} size={88} />
            <div className="flex flex-col gap-2">
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  passed
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {passed ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                )}
                {passed
                  ? "You'd advance to the next round"
                  : "Keep building — here's where to focus"}
              </div>
              <IntegrityBadge level={integrity} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                Style: {styleLabel}
              </span>
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Question Breakdown
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const ans = answers[q.id];
                const isOpen = q.type === "open";
                const isCorrect =
                  !isOpen && typeof ans === "number" && ans === q.correctIndex;
                const selectedOption =
                  typeof ans === "number" && q.options ? q.options[ans] : null;
                const correctOption =
                  q.correctIndex !== undefined && q.options
                    ? q.options[q.correctIndex]
                    : null;

                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-slate-700 leading-snug line-clamp-2">
                        <span className="font-semibold text-slate-400 mr-1">Q{i + 1}.</span>
                        {q.text}
                      </p>
                      {isOpen ? (
                        <span className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                          Reviewed by AI
                        </span>
                      ) : (
                        <span
                          className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                            isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {isCorrect ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                    {!isOpen && selectedOption && (
                      <div className="mt-1.5 space-y-0.5">
                        <div className="text-[11px] text-slate-500">
                          Your answer:{" "}
                          <span className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                            {selectedOption.label}. {selectedOption.text}
                          </span>
                        </div>
                        {!isCorrect && correctOption && (
                          <div className="text-[11px] text-slate-500">
                            Best answer:{" "}
                            <span className="font-medium text-green-700">
                              {correctOption.label}. {correctOption.text}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-all active:scale-[0.98]"
          >
            Start hiring on proof
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ── Tab 2: Hiring Manager Report ── */}
      {activeTab === "manager" && (
        <div>
          {/* Candidate summary card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                CD
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-slate-900">Demo Candidate</div>
                <div className="text-xs text-slate-500">{job.title} Assessment</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Score</div>
                <div
                  className={`text-lg font-black ${
                    passed ? "text-teal-700" : "text-amber-600"
                  }`}
                >
                  {score}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Integrity</div>
                <div
                  className={`text-xs font-bold ${
                    integrity === "High"
                      ? "text-green-700"
                      : integrity === "Medium"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {integrity}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Style</div>
                <div className="text-[11px] font-bold text-purple-700 leading-tight">{styleLabel}</div>
              </div>
            </div>
          </div>

          {/* Show Proof audit trail */}
          <div className="mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Show Proof — Audit Trail
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const ans = answers[q.id];
                const isOpen = q.type === "open";
                const isCorrect =
                  !isOpen && typeof ans === "number" && ans === q.correctIndex;
                const selectedOption =
                  typeof ans === "number" && q.options ? q.options[ans] : null;
                const isExpanded = expandedProof === q.id;

                return (
                  <div key={q.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedProof(isExpanded ? null : q.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {!isOpen && (
                          <span
                            className={`shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${
                              isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isCorrect ? (
                              <Check className="h-2.5 w-2.5" />
                            ) : (
                              <X className="h-2.5 w-2.5" />
                            )}
                          </span>
                        )}
                        {isOpen && (
                          <span className="shrink-0 h-4 w-4 rounded-full bg-teal-100 flex items-center justify-center">
                            <FileText className="h-2.5 w-2.5 text-teal-600" />
                          </span>
                        )}
                        <span className="text-xs font-medium text-slate-700 truncate">
                          Q{i + 1}: {q.text.slice(0, 60)}{q.text.length > 60 ? "…" : ""}
                        </span>
                      </div>
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-100 px-3 py-2.5 bg-slate-50">
                        <div className="text-[11px] text-slate-500 font-medium mb-1">Candidate's answer:</div>
                        {isOpen ? (
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {typeof ans === "string" && ans.length > 0
                              ? ans
                              : <span className="italic text-slate-400">No answer provided</span>}
                          </p>
                        ) : selectedOption ? (
                          <p className="text-xs text-slate-700">
                            <span className="font-semibold">{selectedOption.label}.</span> {selectedOption.text}
                          </p>
                        ) : (
                          <p className="text-xs italic text-slate-400">No answer selected</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Dynamics (illustrative) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Team Dynamics
            </div>
            <div className="mb-2">
              <div className="text-[11px] text-slate-500 font-medium mb-1.5">Complementary Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {["Data-driven thinking", "Structured communication", "Cross-functional"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium mb-1.5">Friction Warnings</div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                May need autonomy to thrive
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2.5 italic">
              Illustrative — sign up to map this against your real team data.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={showDemoToast}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-all active:scale-[0.98]"
            >
              <Check className="h-3.5 w-3.5" />
              Approve for Final Interview
            </button>
            <button
              onClick={showDemoToast}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-all active:scale-[0.98]"
            >
              <X className="h-3.5 w-3.5" />
              Archive Candidate
            </button>
          </div>

          {/* CTA */}
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-all active:scale-[0.98]"
          >
            Build this pipeline for your team
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Main modal ─────────────────────────────────────────── */
export function DemoModal() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("job-select");
  const [selectedJob, setSelectedJob] = useState<DemoJob | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [pasteCount, setPasteCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  function resetState() {
    setPhase("job-select");
    setSelectedJob(null);
    setActiveQuestions([]);
    setCurrentQIndex(0);
    setAnswers({});
    setPasteCount(0);
    setToast(null);
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) resetState();
  }

  function handleJobSelect(job: DemoJob) {
    const qs = getRandomizedQuestions(job.id, 4);
    setSelectedJob(job);
    setActiveQuestions(qs);
    setCurrentQIndex(0);
    setAnswers({});
    setPasteCount(0);
    setPhase("questions");
  }

  function handleAnswer(value: number | string) {
    const q = activeQuestions[currentQIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex((i) => i + 1);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("results");
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const handlePaste = useCallback(() => {
    setPasteCount((c) => {
      const next = c + 1;
      setToast("Event Logged: Paste detected. Included in your Integrity Signal.");
      return next;
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-all active:scale-95">
          Try a Demo Assessment
          <ArrowRight className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden gap-0">
        {/* Integrity status bar (only during questions) */}
        {phase === "questions" && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs font-medium text-amber-800">
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            Live session — window focus, paste events, and typing patterns are logged.
          </div>
        )}

        {/* Toast (questions phase) */}
        {phase === "questions" && toast && (
          <div className="relative">
            <Toast message={toast} onDone={() => setToast(null)} />
          </div>
        )}

        {/* Modal header */}
        {phase !== "job-select" && (
          <div className="flex items-center justify-between px-5 pt-4 pb-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              {selectedJob?.title}
              {phase === "results" && (
                <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                  Results
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setPhase("job-select");
                setSelectedJob(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Change role
            </button>
          </div>
        )}

        {/* Scrollable content area */}
        <div
          ref={scrollRef}
          className="overflow-y-auto max-h-[80vh] px-5 py-4"
        >
          {phase === "job-select" && (
            <JobSelectScreen onSelect={handleJobSelect} />
          )}

          {phase === "questions" && activeQuestions[currentQIndex] && (
            <QuestionScreen
              key={activeQuestions[currentQIndex].id}
              question={activeQuestions[currentQIndex]}
              index={currentQIndex}
              total={activeQuestions.length}
              onAnswer={handleAnswer}
              onPaste={handlePaste}
            />
          )}

          {phase === "results" && selectedJob && (
            <ResultsScreen
              job={selectedJob}
              questions={activeQuestions}
              answers={answers}
              pasteCount={pasteCount}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
