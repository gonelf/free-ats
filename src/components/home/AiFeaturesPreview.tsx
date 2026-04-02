"use client";

import { useState, useEffect, useCallback } from "react";
import type { ComponentType, MouseEvent } from "react";
import {
  Brain,
  Zap,
  FileText,
  Mail,
  MessageCircle,
  Check,
  X,
  ChevronRight,
  Sparkles,
  Pause,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
type FeatureId = "resume" | "score" | "jd" | "email" | "questions";

const FEATURES: { id: FeatureId; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "resume", label: "Resume Parsing", icon: Brain },
  { id: "score", label: "AI Scoring", icon: Zap },
  { id: "jd", label: "Job Description", icon: FileText },
  { id: "email", label: "Email Drafter", icon: Mail },
  { id: "questions", label: "Interview Qs", icon: MessageCircle },
];

const AUTO_ADVANCE_MS = 3800;

/* ─── Feature previews ───────────────────────────────────── */

function ResumeParsing() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
          SC
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-sm">Sarah Chen</div>
          <div className="text-[11px] text-slate-500 truncate">sarah.chen@gmail.com · (415) 555-0192</div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold whitespace-nowrap">
          Parsed in 1.3s
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Experience", value: "6 yrs" },
          { label: "Positions", value: "4 roles" },
          { label: "Education", value: "B.Sc. CS" },
          { label: "Location", value: "San Francisco" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5 text-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold leading-tight">
              {item.label}
            </div>
            <div className="text-[11px] font-bold text-slate-800 mt-0.5 leading-tight">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1.5">
          Skills identified · 8
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["React", "TypeScript", "Node.js", "AWS", "Python", "PostgreSQL", "Docker", "Figma"].map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* LinkedIn row */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <Check className="h-3 w-3 text-teal-500" />
        LinkedIn profile extracted · 2 additional references found
      </div>
    </div>
  );
}

function CandidateScore() {
  const circumference = 2 * Math.PI * 26;
  const score = 87;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Score + identity */}
      <div className="flex items-center gap-4">
        {/* Circular score */}
        <div className="relative w-[72px] h-[72px] shrink-0">
          <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="7" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#0d9488"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-slate-900 leading-none">{score}</span>
            <span className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">/ 100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-sm">Alex Johnson</div>
          <div className="text-[11px] text-slate-500 mb-2">Applying for · Senior Frontend Engineer</div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">Recommendation</div>
          <div className="text-xs text-teal-700 font-semibold mt-0.5">Strong hire — move to technical round</div>
        </div>
      </div>

      {/* Strengths / Gaps */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-green-50 border border-green-100 p-2.5 space-y-1.5">
          <div className="text-[9px] text-green-700 uppercase tracking-wide font-bold">Strengths</div>
          {["React + TypeScript expert", "5 yrs matches seniority", "Remote-first background"].map((s) => (
            <div key={s} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-tight">
              <Check className="h-3 w-3 text-green-500 shrink-0 mt-px" />
              {s}
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-2.5 space-y-1.5">
          <div className="text-[9px] text-amber-700 uppercase tracking-wide font-bold">Gaps</div>
          {["No GraphQL mentioned", "Limited mobile exp."].map((s) => (
            <div key={s} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-tight">
              <X className="h-3 w-3 text-amber-400 shrink-0 mt-px" />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobDescriptionPreview() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Input row */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-xs text-slate-600 flex-1 truncate">Senior Product Designer · Remote</span>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-600 text-white text-[10px] font-bold shrink-0">
          <Sparkles className="h-3 w-3" />
          Generated
        </div>
      </div>

      {/* Summary */}
      <p className="text-[11px] text-slate-600 leading-relaxed">
        We&apos;re looking for a Senior Product Designer to join our growing design team. You&apos;ll shape user
        experiences across our core product, collaborating with engineers and PMs to ship features users love.
      </p>

      {/* Requirements */}
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1.5">Requirements</div>
        <div className="space-y-1.5">
          {[
            "5+ years of product design experience",
            "Expert-level Figma and design systems skills",
            "Track record shipping B2B SaaS products",
          ].map((r) => (
            <div key={r} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-tight">
              <ChevronRight className="h-3 w-3 text-teal-500 shrink-0 mt-px" />
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-semibold">
          $120k–$150k
        </span>
        <span className="px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-semibold">
          Inclusivity 94 / 100
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
          6 screening Qs generated
        </span>
      </div>
    </div>
  );
}

function EmailDraftPreview() {
  const [active, setActive] = useState<"outreach" | "invite" | "rejection" | "offer">("invite");

  const content = {
    outreach: {
      subject: "Quick intro — love your background in product design",
      body: "Hi Sarah, I came across your profile and was genuinely impressed by your work at Stripe. We're building something exciting at Acme and think you'd be a great fit...",
    },
    invite: {
      subject: "Interview invitation — Product Designer at Acme Inc",
      body: "Hi Alex, thank you for applying for the Product Designer role. We've reviewed your profile and would love to schedule a 45-minute conversation to learn more about your experience...",
    },
    rejection: {
      subject: "Your application to Acme Inc — Product Designer",
      body: "Hi Jordan, thank you for taking the time to interview with us. After careful consideration, we've decided to move forward with another candidate whose experience more closely aligns...",
    },
    offer: {
      subject: "Offer letter — Product Designer, Acme Inc",
      body: "Hi Sarah, we're thrilled to offer you the position of Senior Product Designer. Your start date would be May 15th, 2025, with a base salary of $138,000...",
    },
  };

  const tabs: { id: typeof active; label: string }[] = [
    { id: "outreach", label: "Outreach" },
    { id: "invite", label: "Interview" },
    { id: "rejection", label: "Rejection" },
    { id: "offer", label: "Offer" },
  ];

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Type tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={(e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setActive(t.id); }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
              active === t.id ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Email preview */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-3 py-2">
          <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Subject</div>
          <div className="text-[11px] font-semibold text-slate-800 leading-snug">{content[active].subject}</div>
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[11px] text-slate-600 leading-relaxed">{content[active].body}</p>
          <p className="text-[11px] text-slate-400 italic">— Edit and send directly from KiteHR</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <Sparkles className="h-3 w-3 text-teal-400" />
        Personalised to candidate profile · ready to send or edit
      </div>
    </div>
  );
}

function InterviewQuestionsPreview() {
  const [tab, setTab] = useState<"behavioral" | "technical" | "culture">("behavioral");

  const questions = {
    behavioral: [
      "Tell me about a time you had to align multiple stakeholders on a design decision.",
      "Describe a project where you simplified a complex workflow. What was your process?",
    ],
    technical: [
      "Walk me through how you approach building a design system from scratch.",
      "How do you handle design handoff to ensure developers implement accurately?",
    ],
    culture: [
      "What does a great design culture look like to you?",
      "How do you give and receive design feedback constructively?",
    ],
  };

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "behavioral", label: "Behavioral" },
    { id: "technical", label: "Technical" },
    { id: "culture", label: "Culture Fit" },
  ];

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Tabs */}
      <div className="flex items-center gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={(e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setTab(t.id); }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
              tab === t.id ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {questions[tab].map((q, i) => (
          <div key={q} className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-100 p-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-px">
              {i + 1}
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">{q}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <Sparkles className="h-3 w-3 text-teal-400" />
        Tailored to Senior Product Designer + candidate profile
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {["Behavioral · 4 Qs", "Technical · 4 Qs", "Culture Fit · 3 Qs"].map((badge) => (
          <span key={badge} className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-semibold">
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Preview content map ────────────────────────────────── */
const PREVIEW: Record<FeatureId, ComponentType> = {
  resume: ResumeParsing,
  score: CandidateScore,
  jd: JobDescriptionPreview,
  email: EmailDraftPreview,
  questions: InterviewQuestionsPreview,
};

/* ─── Main component ─────────────────────────────────────── */
export function AiFeaturesPreview() {
  const [active, setActive] = useState<FeatureId>("resume");
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setActive((prev: FeatureId) => {
        const idx = FEATURES.findIndex((f) => f.id === prev);
        return FEATURES[(idx + 1) % FEATURES.length].id;
      });
      setVisible(true);
    }, 180);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, advance]);

  function handleTabClick(id: FeatureId) {
    if (id === active) return;
    setPaused(true);
    setVisible(false);
    setTimeout(() => {
      setActive(id);
      setVisible(true);
    }, 180);
  }

  const ActivePreview = PREVIEW[active];

  return (
    <div className="flex flex-col bg-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Tab bar */}
      <div className="flex items-center gap-px border-b border-slate-100 bg-slate-50 overflow-x-auto scrollbar-none">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          const isActive = f.id === active;
          return (
            <button
              key={f.id}
              onClick={() => handleTabClick(f.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                isActive
                  ? "border-teal-600 text-teal-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60"
              }`}
            >
              <Icon className={`h-3 w-3 shrink-0 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
              {f.label}
            </button>
          );
        })}

        {/* Pause indicator */}
        <div className="ml-auto pr-2.5 flex items-center">
          {paused ? (
            <Pause className="h-3 w-3 text-slate-300" />
          ) : (
            /* Progress dots */
            <div className="flex items-center gap-1">
              {FEATURES.map((f) => (
                <div
                  key={f.id}
                  className={`rounded-full transition-all duration-300 ${
                    f.id === active ? "w-3 h-1.5 bg-teal-500" : "w-1.5 h-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content area — fixed height to prevent layout shift */}
      <div
        className="min-h-[252px] transition-opacity duration-150"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <ActivePreview />
      </div>

      {/* Footer bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-t border-slate-100 bg-slate-50">
        <Sparkles className="h-3 w-3 text-teal-500 shrink-0" />
        <span className="text-[10px] text-slate-500 font-medium">
          Powered by Gemini Flash · AI that works for you, not the other way around
        </span>
      </div>
    </div>
  );
}
