"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Shield } from "lucide-react";
import { getAllQuestions, type DemoJob, type Question } from "@/components/home/demo-data";
import type { Phase, IntegrityEvent } from "./types";
import { QuestionsScreen } from "./QuestionsScreen";
import { ResultsScreen } from "./ResultsScreen";

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function computeScore(questions: Question[], answers: Record<string, number | string>): number {
  let earned = 0;
  for (const q of questions) {
    if (q.type === "mc") {
      if (answers[q.id] === q.correctIndex) earned += 8;
    } else if (q.type === "open") {
      earned += 6;
    } else if (q.type === "style") {
      if (answers[q.id] === q.correctIndex) earned += 8;
      else if (answers[q.id] !== undefined) earned += 3;
    }
  }
  return Math.round((earned / (questions.length * 8)) * 100);
}

function getIntegrityLabel(events: IntegrityEvent[]): "High" | "Medium" | "Low" {
  if (events.length === 0) return "High";
  if (events.length <= 2) return "Medium";
  return "Low";
}

function getStyleLabel(questions: Question[], answers: Record<string, number | string>): string {
  for (const q of questions) {
    if (q.type === "style" && q.styleLabels && answers[q.id] !== undefined) {
      return q.styleLabels[answers[q.id] as number] ?? "Results-Oriented";
    }
  }
  return "Results-Oriented";
}

const JOB_EMOJI: Record<string, string> = {
  "frontend-engineer": "💻",
  "customer-success": "🤝",
  "product-manager": "🗺️",
  "sales-dev-rep": "📞",
  "data-analyst": "📊",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function AssessmentClient({ job }: { job: DemoJob }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerStarted, setTimerStarted] = useState(false);
  const [integrityLog, setIntegrityLog] = useState<IntegrityEvent[]>([]);
  const [dictating, setDictating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [scoreAnimated, setScoreAnimated] = useState(false);

  // Stable refs for event handlers that need current values without re-registering
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const currentQRef = useRef(currentQIndex);
  currentQRef.current = currentQIndex;

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const addIntegrityEvent = useCallback(
    (description: string, severity: IntegrityEvent["severity"]) => {
      setIntegrityLog((prev) => [
        ...prev,
        {
          timeRemaining: formatTime(timeLeftRef.current),
          questionNum: currentQRef.current + 1,
          description,
          severity,
        },
      ]);
      showToast(`Integrity event logged: ${description}`);
    },
    [showToast]
  );

  // Initialise questions on mount
  useEffect(() => {
    setActiveQuestions(getAllQuestions(job.id));
  }, [job.id]);

  // Timer countdown
  useEffect(() => {
    if (!timerStarted || phase !== "questions") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("results");
          setTimeout(() => setScoreAnimated(true), 300);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerStarted, phase]);

  // Integrity: tab/window focus listeners
  useEffect(() => {
    if (phase !== "questions") return;
    const onHide = () => {
      if (document.hidden) addIntegrityEvent("Tab or window switched during assessment", "medium");
    };
    const onBlur = () => addIntegrityEvent("Window focus lost during assessment", "low");
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onBlur);
    };
  }, [phase, addIntegrityEvent]);

  const handleBegin = () => {
    setTimerStarted(true);
    setPhase("questions");
  };

  const handleAnswer = (questionId: string, value: number | string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const handlePaste = (questionId: string) => {
    void questionId;
    addIntegrityEvent("Paste detected in open-response question", "high");
  };

  const handleDictate = (questionId: string, transcript: string) => {
    setDictating(true);
    setTimeout(() => {
      setDictating(false);
      handleAnswer(questionId, transcript);
    }, 1200);
  };

  const handleSubmit = () => {
    setPhase("results");
    setTimeout(() => setScoreAnimated(true), 300);
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <div className="container mx-auto max-w-xl px-6 py-16">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to roles
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4" role="img" aria-label={job.title}>
                {JOB_EMOJI[job.id] ?? "🎯"}
              </div>
              <h1 className="font-heading font-black text-2xl text-slate-900 mb-1">{job.title}</h1>
              <p className="text-sm text-slate-500">Signal Micro-Audition</p>
            </div>

            <div className="flex items-center justify-center gap-6 py-4 mb-6 rounded-xl bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                <Clock className="h-4 w-4 text-teal-600" /> 13 questions
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-sm font-semibold text-slate-600">10 minutes</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                <Shield className="h-4 w-4 text-teal-600" /> Monitored session
              </span>
            </div>

            <div className="mb-8">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                What&apos;s monitored
              </p>
              <ul className="space-y-2">
                {[
                  "Tab and window focus events",
                  "Paste activity in text responses",
                  "Typing patterns",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleBegin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-all active:scale-95"
            >
              Begin Assessment
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  if (phase === "questions" && activeQuestions.length > 0) {
    return (
      <QuestionsScreen
        job={job}
        questions={activeQuestions}
        currentQIndex={currentQIndex}
        answers={answers}
        timeLeft={timeLeft}
        integrityCount={integrityLog.length}
        dictating={dictating}
        onAnswer={handleAnswer}
        onPaste={handlePaste}
        onDictate={handleDictate}
        onPrev={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
        onNext={() => setCurrentQIndex((i) => i + 1)}
        onSubmit={handleSubmit}
        toastMsg={toastMsg}
      />
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === "results") {
    const score = computeScore(activeQuestions, answers);
    return (
      <ResultsScreen
        job={job}
        questions={activeQuestions}
        answers={answers}
        score={score}
        passed={score >= 75}
        integrityLabel={getIntegrityLabel(integrityLog)}
        styleLabel={getStyleLabel(activeQuestions, answers)}
        integrityLog={integrityLog}
        scoreAnimated={scoreAnimated}
        onToast={showToast}
      />
    );
  }

  return null;
}
