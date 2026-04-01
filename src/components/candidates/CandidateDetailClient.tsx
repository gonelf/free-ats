"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Pencil,
  X,
  Save,
  Trophy,
  Briefcase,
  Mail,
  GitBranch,
  HelpCircle,
  Copy,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  BookMarked,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AiButton } from "@/components/ai/AiGate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  addNote,
  deleteNote,
  addCandidateToJob,
  moveApplicationStage,
  saveCandidateProfile,
} from "@/app/actions";
import { formatDate, cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ScoringResult {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

type EmailType = "outreach" | "rejection" | "offer" | "interview_invite" | "follow_up";

interface GapResult {
  matched: string[];
  missing: string[];
  partial: string[];
  developmentPlan: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  resumeExpiresAt: Date | null;
  tags: string[];
  summary: string | null;
  workExperience: WorkExperience[];
  achievements: string[];
  createdAt: Date;
  notes: Array<{ id: string; content: string; authorId: string; createdAt: Date }>;
  aiSummary: { summary: string; createdAt: Date } | null;
  applications: Array<{
    id: string;
    aiScore: number | null;
    aiScoreSummary: { strengths: string[]; gaps: string[]; recommendation: string } | null;
    aiGapAnalysis: unknown;
    aiInterviewQuestions: unknown;
    aiReferenceQuestions: string[];
    job: {
      id: string;
      title: string;
      status: string;
      pipeline: {
        stages: Array<{ id: string; name: string; color: string; order: number }>;
      };
    };
    stage: { id: string; name: string; color: string };
  }>;
}

interface Communication {
  id: string;
  type: string;
  subject: string;
  body: string;
  authorId: string;
  createdAt: Date;
  job: { id: string; title: string } | null;
}

interface CandidateDetailClientProps {
  candidate: Candidate;
  hasAiAccess: boolean;
  currentUserId: string;
  jobs: Array<{ id: string; title: string }>;
  communications: Communication[];
}

const typeLabels: Record<string, { label: string; color: string }> = {
  OUTREACH:         { label: "Outreach",        color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  INTERVIEW_INVITE: { label: "Interview Invite", color: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" },
  FOLLOW_UP:        { label: "Follow-up",        color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" },
  OFFER:            { label: "Offer",            color: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  REJECTION:        { label: "Rejection",        color: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
};

// ─── Empty experience helper ─────────────────────────────────────────────────

const emptyExp = (): WorkExperience => ({
  title: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
});

// ─── Component ───────────────────────────────────────────────────────────────

export function CandidateDetailClient({
  candidate,
  hasAiAccess,
  currentUserId,
  jobs,
  communications: initialCommunications,
}: CandidateDetailClientProps) {
  // ── Profile form state ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone ?? "",
    linkedinUrl: candidate.linkedinUrl ?? "",
    summary: candidate.summary ?? "",
    workExperience: candidate.workExperience ?? [],
    achievements: candidate.achievements ?? [],
    skills: candidate.tags ?? [],
  });
  const [formDirty, setFormDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Parse resume state ───────────────────────────────────────────────────
  const [parsingResume, setParsingResume] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [parseError, setParseError] = useState("");

  // ── Work experience editing ──────────────────────────────────────────────
  const [editingExpIdx, setEditingExpIdx] = useState<number | null>(null);
  const [expDraft, setExpDraft] = useState<WorkExperience>(emptyExp());
  const [addingExp, setAddingExp] = useState(false);
  const [newExp, setNewExp] = useState<WorkExperience>(emptyExp());

  // ── Achievements / skills ────────────────────────────────────────────────
  const [newAchievement, setNewAchievement] = useState("");
  const [newSkill, setNewSkill] = useState("");

  // ── AI Summary (existing) ────────────────────────────────────────────────
  const [aiSummary, setAiSummary] = useState(candidate.aiSummary?.summary ?? "");
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);

  // ── Notes ────────────────────────────────────────────────────────────────
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // ── Applications ─────────────────────────────────────────────────────────
  const [selectedJobId, setSelectedJobId] = useState("");
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
  const [scoringAppId, setScoringAppId] = useState<string | null>(null);
  const [appScores, setAppScores] = useState<Record<string, ScoringResult>>(() => {
    const initial: Record<string, ScoringResult> = {};
    for (const app of candidate.applications) {
      if (app.aiScore !== null) {
        initial[app.id] = {
          score: app.aiScore,
          strengths: app.aiScoreSummary?.strengths ?? [],
          gaps: app.aiScoreSummary?.gaps ?? [],
          recommendation: app.aiScoreSummary?.recommendation ?? "",
        };
      }
    }
    return initial;
  });

  // ── Communications ────────────────────────────────────────────────────────
  const [communications, setCommunications] = useState<Communication[]>(initialCommunications);
  const [expandedCommId, setExpandedCommId] = useState<string | null>(null);

  // ── Compose modal ─────────────────────────────────────────────────────────
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeJobId, setComposeJobId] = useState("");
  const [emailType, setEmailType] = useState<EmailType>("outreach");
  const [emailContext, setEmailContext] = useState("");
  const [draftingEmail, setDraftingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ subject: string; body: string; communicationId: string } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [draftingRejection, setDraftingRejection] = useState(false);

  // ── Skills gap ────────────────────────────────────────────────────────────
  const [gapAppId, setGapAppId] = useState<string | null>(null);
  const [appGaps, setAppGaps] = useState<Record<string, GapResult>>(() => {
    const initial: Record<string, GapResult> = {};
    for (const app of candidate.applications) {
      if (app.aiGapAnalysis) {
        const raw = app.aiGapAnalysis as Partial<GapResult>;
        initial[app.id] = {
          matched: raw.matched ?? [],
          partial: raw.partial ?? [],
          missing: raw.missing ?? [],
          developmentPlan: raw.developmentPlan ?? "",
        };
      }
    }
    return initial;
  });

  // ── Reference questions ───────────────────────────────────────────────────
  const [refQAppId, setRefQAppId] = useState<string | null>(null);
  const [appRefQuestions, setAppRefQuestions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const app of candidate.applications) {
      if (app.aiReferenceQuestions.length) initial[app.id] = app.aiReferenceQuestions;
    }
    return initial;
  });

  // ── Interview questions ───────────────────────────────────────────────────
  const [interviewQAppId, setInterviewQAppId] = useState<string | null>(null);
  const [appInterviewQuestions, setAppInterviewQuestions] = useState<
    Record<string, { behavioral: string[]; technical: string[]; culture: string[] }>
  >(() => {
    const initial: Record<string, { behavioral: string[]; technical: string[]; culture: string[] }> = {};
    for (const app of candidate.applications) {
      if (app.aiInterviewQuestions) {
        const raw = app.aiInterviewQuestions as Partial<{ behavioral: string[]; technical: string[]; culture: string[] }>;
        initial[app.id] = {
          behavioral: raw.behavioral ?? [],
          technical: raw.technical ?? [],
          culture: raw.culture ?? [],
        };
      }
    }
    return initial;
  });

  // ── Left panel tab ────────────────────────────────────────────────────────
  const [leftTab, setLeftTab] = useState<"profile" | "experience" | "skills">("profile");

  // ── Right panel tab ───────────────────────────────────────────────────────
  const [rightTab, setRightTab] = useState<"resume" | "ai" | "notes" | "comms" | "interviews">(
    candidate.resumeUrl ? "resume" : "ai"
  );

  // ── Interviews ────────────────────────────────────────────────────────────
  const [interviews, setInterviews] = useState<Array<{
    id: string;
    title: string;
    scheduledAt: Date | null;
    duration: number;
    meetingLink: string | null;
    timezone: string;
    status: string;
    notes: string | null;
    applicationId: string;
    feedbacks: Array<{
      id: string;
      overallRating: number;
      recommendation: string;
      notes: string | null;
      aiDrafted: boolean;
    }>;
  }>>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [interviewsLoaded, setInterviewsLoaded] = useState(false);
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [newInterviewForm, setNewInterviewForm] = useState({
    title: "Interview",
    scheduledAt: "",
    duration: 60,
    meetingLink: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notes: "",
  });
  const [savingInterview, setSavingInterview] = useState(false);

  // ── Screening state ───────────────────────────────────────────────────────
  const [screenings, setScreenings] = useState<Record<string, {
    id: string;
    applicationId: string;
    screeningToken: string | null;
    screeningTokenExpiresAt: Date | null;
    questions: Array<{ id: string; question: string; type: string }>;
    responses: Array<{ questionId: string; answer: string; answeredAt: string }> | null;
    flagged: boolean;
    flagReason: string | null;
    completedAt: Date | null;
  }>>({});
  const [generatingScreening, setGeneratingScreening] = useState<string | null>(null);
  const [screeningLinkCopied, setScreeningLinkCopied] = useState<string | null>(null);

  // ── Scorecard state ───────────────────────────────────────────────────────
  const [scorecardInterviewId, setScorecardInterviewId] = useState<string | null>(null);
  const [scorecardDraft, setScorecardDraft] = useState<{
    rubricScores: { criterion: string; score: number; notes: string }[];
    overallRating: number;
    recommendation: string;
    notes: string;
  } | null>(null);
  const [draftingScorecard, setDraftingScorecard] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function patchForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormDirty(true);
    setSaveSuccess(false);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await saveCandidateProfile(candidate.id, form);
      setFormDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleParseResume() {
    setParsingResume(true);
    setParseError("");
    setParseSuccess(false);
    try {
      const res = await fetch("/api/ai/parse-resume-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        setParseError(err.error ?? "Failed to parse resume");
        return;
      }
      const data = await res.json();
      setForm((prev) => ({
        firstName: data.firstName || prev.firstName,
        lastName: data.lastName || prev.lastName,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
        summary: data.summary || prev.summary,
        workExperience: data.experience?.length ? data.experience : prev.workExperience,
        achievements: data.achievements?.length ? data.achievements : prev.achievements,
        skills: data.skills?.length ? data.skills : prev.skills,
      }));
      setFormDirty(true);
      setParseSuccess(true);
    } finally {
      setParsingResume(false);
    }
  }

  async function handleGenerateAiSummary() {
    setGeneratingAiSummary(true);
    try {
      const res = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      }
    } finally {
      setGeneratingAiSummary(false);
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await addNote(candidate.id, note);
      setNote("");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleScoreApplication(applicationId: string) {
    setScoringAppId(applicationId);
    try {
      const res = await fetch("/api/ai/score-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppScores((prev) => ({
          ...prev,
          [applicationId]: {
            score: data.score ?? 0,
            strengths: data.strengths ?? [],
            gaps: data.gaps ?? [],
            recommendation: data.recommendation ?? "",
          },
        }));
      }
    } finally {
      setScoringAppId(null);
    }
  }

  async function handleDraftEmail() {
    setDraftingEmail(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/ai/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          candidateId: candidate.id,
          jobId: composeJobId || undefined,
          additionalContext: emailContext || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailResult(data);
      }
    } finally {
      setDraftingEmail(false);
    }
  }

  async function handleDraftRejection(applicationId: string) {
    setDraftingRejection(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/ai/draft-rejection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailResult(data);
      }
    } finally {
      setDraftingRejection(false);
    }
  }

  function handleLogAndClose() {
    if (emailResult?.communicationId) {
      const job = candidate.applications.find((a) => a.job.id === composeJobId)?.job ?? null;
      setCommunications((prev) => [
        {
          id: emailResult.communicationId,
          type: emailType.toUpperCase(),
          subject: emailResult.subject,
          body: emailResult.body,
          authorId: currentUserId,
          createdAt: new Date(),
          job: job ? { id: job.id, title: job.title } : null,
        },
        ...prev,
      ]);
    }
    setComposeOpen(false);
    setEmailResult(null);
    setEmailContext("");
  }

  async function handleSaveAsTemplate() {
    if (!emailResult?.communicationId) return;
    setSavingTemplate(true);
    try {
      await fetch(`/api/communications/${emailResult.communicationId}/save-as-template`, {
        method: "POST",
      });
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleDeleteCommunication(id: string) {
    const res = await fetch(`/api/communications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCommunications((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function loadInterviews() {
    if (interviewsLoaded) return;
    setLoadingInterviews(true);
    try {
      const appIds = candidate.applications.map((a) => a.id);
      if (appIds.length === 0) { setInterviewsLoaded(true); return; }
      const res = await fetch(`/api/interviews?applicationIds=${appIds.join(",")}`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } finally {
      setLoadingInterviews(false);
      setInterviewsLoaded(true);
    }
  }

  async function handleScheduleInterview(applicationId: string) {
    setSavingInterview(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          title: newInterviewForm.title,
          scheduledAt: newInterviewForm.scheduledAt || null,
          duration: newInterviewForm.duration,
          meetingLink: newInterviewForm.meetingLink || null,
          timezone: newInterviewForm.timezone,
          notes: newInterviewForm.notes || null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setInterviews((prev) => [{ ...created, feedbacks: [] }, ...prev]);
        setSchedulingAppId(null);
        setNewInterviewForm({ title: "Interview", scheduledAt: "", duration: 60, meetingLink: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, notes: "" });
      }
    } finally {
      setSavingInterview(false);
    }
  }

  async function handleDraftScorecard(interviewId: string) {
    setDraftingScorecard(true);
    setScorecardInterviewId(interviewId);
    try {
      const res = await fetch("/api/ai/draft-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });
      if (res.ok) {
        const data = await res.json();
        setScorecardDraft(data);
      }
    } finally {
      setDraftingScorecard(false);
    }
  }

  async function handleGenerateScreening(applicationId: string) {
    setGeneratingScreening(applicationId);
    try {
      const res = await fetch("/api/ai/generate-screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setScreenings((prev) => ({ ...prev, [applicationId]: data }));
      }
    } finally {
      setGeneratingScreening(null);
    }
  }

  function handleCopyScreeningLink(applicationId: string) {
    const screening = screenings[applicationId];
    if (!screening?.screeningToken) return;
    const url = `${window.location.origin}/screen/${screening.screeningToken}`;
    navigator.clipboard.writeText(url);
    setScreeningLinkCopied(applicationId);
    setTimeout(() => setScreeningLinkCopied(null), 2000);
  }

  async function handleSubmitFeedback(interviewId: string) {
    if (!scorecardDraft) return;
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scorecardDraft,
          aiDrafted: true,
        }),
      });
      if (res.ok) {
        const feedback = await res.json();
        setInterviews((prev) =>
          prev.map((i) =>
            i.id === interviewId
              ? { ...i, status: "COMPLETED", feedbacks: [...i.feedbacks, feedback] }
              : i
          )
        );
        setScorecardInterviewId(null);
        setScorecardDraft(null);
      }
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function handleSkillsGap(applicationId: string) {
    setGapAppId(applicationId);
    try {
      const app = candidate.applications.find((a) => a.id === applicationId);
      if (!app) return;
      const res = await fetch("/api/ai/skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id, jobId: app.job.id, applicationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppGaps((prev) => ({
          ...prev,
          [applicationId]: {
            matched: data.matched ?? [],
            partial: data.partial ?? [],
            missing: data.missing ?? [],
            developmentPlan: data.developmentPlan ?? "",
          },
        }));
      }
    } finally {
      setGapAppId(null);
    }
  }

  async function handleRefQuestions(applicationId: string) {
    setRefQAppId(applicationId);
    try {
      const app = candidate.applications.find((a) => a.id === applicationId);
      if (!app) return;
      const res = await fetch("/api/ai/reference-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id, jobId: app.job.id, applicationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppRefQuestions((prev) => ({ ...prev, [applicationId]: data }));
      }
    } finally {
      setRefQAppId(null);
    }
  }

  async function handleInterviewQuestions(applicationId: string) {
    setInterviewQAppId(applicationId);
    try {
      const app = candidate.applications.find((a) => a.id === applicationId);
      if (!app) return;
      const res = await fetch("/api/ai/suggest-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id, jobId: app.job.id, applicationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppInterviewQuestions((prev) => ({
          ...prev,
          [applicationId]: {
            behavioral: data.behavioral ?? [],
            technical: data.technical ?? [],
            culture: data.culture ?? [],
          },
        }));
      }
    } finally {
      setInterviewQAppId(null);
    }
  }

  function startEditExp(idx: number) {
    setEditingExpIdx(idx);
    setExpDraft({ ...form.workExperience[idx] });
  }

  function saveEditExp() {
    if (editingExpIdx === null) return;
    const updated = [...form.workExperience];
    updated[editingExpIdx] = expDraft;
    patchForm("workExperience", updated);
    setEditingExpIdx(null);
  }

  function removeExp(idx: number) {
    patchForm(
      "workExperience",
      form.workExperience.filter((_, i) => i !== idx)
    );
  }

  function commitNewExp() {
    if (!newExp.title && !newExp.company) return;
    patchForm("workExperience", [...form.workExperience, newExp]);
    setNewExp(emptyExp());
    setAddingExp(false);
  }

  function addAchievement() {
    if (!newAchievement.trim()) return;
    patchForm("achievements", [...form.achievements, newAchievement.trim()]);
    setNewAchievement("");
  }

  function removeAchievement(idx: number) {
    patchForm(
      "achievements",
      form.achievements.filter((_, i) => i !== idx)
    );
  }

  function addSkill() {
    if (!newSkill.trim() || form.skills.includes(newSkill.trim())) return;
    patchForm("skills", [...form.skills, newSkill.trim()]);
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    patchForm(
      "skills",
      form.skills.filter((s) => s !== skill)
    );
  }

  async function handleAddToJob() {
    if (!selectedJobId) return;
    await addCandidateToJob(candidate.id, selectedJobId);
    setSelectedJobId("");
  }

  const unappliedJobs = jobs.filter(
    (j) => !candidate.applications.find((a) => a.job.id === j.id)
  );

  const hasResume = !!candidate.resumeUrl;

  // Profile completeness — based on saved DB values, not unsaved form state
  const missingProfileFields: string[] = [];
  if (!candidate.summary) missingProfileFields.push("summary");
  if (!candidate.tags.length) missingProfileFields.push("skills");
  if (!candidate.workExperience.length) missingProfileFields.push("work experience");
  const profileComplete = missingProfileFields.length === 0;

  // ── Layout ────────────────────────────────────────────────────────────────

  const leftTabs: { key: typeof leftTab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "experience", label: "Experience" },
    { key: "skills", label: "Skills" },
  ];

  const profilePanel = (
    <div className="space-y-5">
      {/* ── Parse banner ─────────────────────────────────────────── */}
      {parseSuccess && (
        <div className="flex items-center justify-between rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 px-4 py-2.5">
          <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
            Resume parsed — review the fields below and save.
          </p>
          <button onClick={() => setParseSuccess(false)}>
            <X className="h-4 w-4 text-indigo-400" />
          </button>
        </div>
      )}
      {parseError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2.5">
          <p className="text-sm text-red-700 dark:text-red-400">{parseError}</p>
        </div>
      )}

      {/* ── Left panel tab bar ───────────────────────────────────── */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5 gap-0.5">
        {leftTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setLeftTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              leftTab === t.key
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contact ──────────────────────────────────────────────── */}
      {leftTab === "profile" && <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Contact
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">First Name</label>
            <Input
              value={form.firstName}
              onChange={(e) => patchForm("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Last Name</label>
            <Input
              value={form.lastName}
              onChange={(e) => patchForm("lastName", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => patchForm("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => patchForm("phone", e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">LinkedIn URL</label>
            <Input
              value={form.linkedinUrl}
              onChange={(e) => patchForm("linkedinUrl", e.target.value)}
              placeholder="—"
            />
          </div>
        </div>
      </div>}

      {/* ── Professional Summary ─────────────────────────────────── */}
      {leftTab === "profile" && <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Professional Summary
        </h2>
        <Textarea
          value={form.summary}
          onChange={(e) => patchForm("summary", e.target.value)}
          placeholder="A brief professional summary…"
          rows={4}
        />
      </div>}

      {/* ── Skills ───────────────────────────────────────────────── */}
      {leftTab === "skills" && <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Skills</h2>
          {hasAiAccess && (
            <AiButton
              hasAiAccess={hasAiAccess}
              loading={false}
              onClick={async () => {
                const res = await fetch("/api/ai/tag-candidate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ candidateId: candidate.id }),
                });
                if (res.ok) {
                  const data = await res.json();
                  patchForm("skills", data.tags ?? []);
                }
              }}
              creditCost={2}
              className="text-[10px] h-6 px-2"
            >
              Auto-tag
            </AiButton>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {form.skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400"
            >
              {skill}
              <button onClick={() => removeSkill(skill)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {form.skills.length === 0 && (
            <span className="text-xs text-gray-400 italic">No skills yet</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Add a skill…"
            className="h-7 text-xs"
          />
          <Button size="sm" variant="outline" className="h-7 px-2" onClick={addSkill}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>}

      {/* ── Work Experience ──────────────────────────────────────── */}
      {leftTab === "experience" && <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Work Experience
          </h2>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => { setAddingExp(true); setNewExp(emptyExp()); }}
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>

        <div className="space-y-3">
          {form.workExperience.map((exp, idx) => (
            <div key={idx} className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
              {editingExpIdx === idx ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={expDraft.title}
                      onChange={(e) => setExpDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="Job title"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={expDraft.company}
                      onChange={(e) => setExpDraft((d) => ({ ...d, company: e.target.value }))}
                      placeholder="Company"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={expDraft.startDate}
                      onChange={(e) => setExpDraft((d) => ({ ...d, startDate: e.target.value }))}
                      placeholder="Start date"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={expDraft.endDate}
                      onChange={(e) => setExpDraft((d) => ({ ...d, endDate: e.target.value }))}
                      placeholder="End date"
                      className="h-7 text-xs"
                    />
                  </div>
                  <Textarea
                    value={expDraft.description}
                    onChange={(e) => setExpDraft((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Description…"
                    rows={3}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 px-2 gap-1 text-xs" onClick={saveEditExp}>
                      <Save className="h-3 w-3" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditingExpIdx(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{exp.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {exp.company}
                        {(exp.startDate || exp.endDate) && (
                          <span className="ml-1 text-gray-400 dark:text-gray-500">
                            · {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => startEditExp(idx)}
                        className="text-gray-300 hover:text-indigo-500 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeExp(idx)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {exp.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {form.workExperience.length === 0 && !addingExp && (
            <p className="text-xs text-gray-400 italic">No experience added yet</p>
          )}

          {/* New experience form */}
          {addingExp && (
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={newExp.title}
                  onChange={(e) => setNewExp((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Job title"
                  className="h-7 text-xs"
                  autoFocus
                />
                <Input
                  value={newExp.company}
                  onChange={(e) => setNewExp((d) => ({ ...d, company: e.target.value }))}
                  placeholder="Company"
                  className="h-7 text-xs"
                />
                <Input
                  value={newExp.startDate}
                  onChange={(e) => setNewExp((d) => ({ ...d, startDate: e.target.value }))}
                  placeholder="Start date"
                  className="h-7 text-xs"
                />
                <Input
                  value={newExp.endDate}
                  onChange={(e) => setNewExp((d) => ({ ...d, endDate: e.target.value }))}
                  placeholder="End date"
                  className="h-7 text-xs"
                />
              </div>
              <Textarea
                value={newExp.description}
                onChange={(e) => setNewExp((d) => ({ ...d, description: e.target.value }))}
                placeholder="Description…"
                rows={3}
                className="text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 px-2 gap-1 text-xs" onClick={commitNewExp}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setAddingExp(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>}

      {/* ── Achievements ─────────────────────────────────────────── */}
      {leftTab === "experience" && <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Achievements
        </h2>
        <ul className="space-y-1.5 mb-3">
          {form.achievements.map((a, idx) => (
            <li key={idx} className="flex items-start gap-2 group">
              <Trophy className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{a}</span>
              <button
                onClick={() => removeAchievement(idx)}
                className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {form.achievements.length === 0 && (
            <p className="text-xs text-gray-400 italic">No achievements added yet</p>
          )}
        </ul>
        <div className="flex gap-2">
          <Input
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAchievement()}
            placeholder="Add an achievement…"
            className="h-7 text-xs"
          />
          <Button size="sm" variant="outline" className="h-7 px-2" onClick={addAchievement}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>}
    </div>
  );

  // ── Tab content: Notes ────────────────────────────────────────────────────

  const notesContent = (
    <div className="space-y-2 mb-4">
      <Textarea
        placeholder="Add a note about this candidate…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
      />
      <Button size="sm" onClick={handleAddNote} disabled={!note.trim() || addingNote}>
        {addingNote ? "Adding…" : "Add Note"}
      </Button>
      <div className="mt-2">
        {candidate.notes.length > 0 ? (
          <div className="space-y-3">
            {candidate.notes.map((n) => (
              <div key={n.id} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{n.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(n.createdAt)}</span>
                  {n.authorId === currentUserId && (
                    <button
                      onClick={() => deleteNote(n.id, candidate.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No notes yet</p>
        )}
      </div>
    </div>
  );

  // ── Tab content: AI helpers ───────────────────────────────────────────────

  const aiContent = (
    <div className="space-y-4">
      {/* AI Assessment */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            AI Assessment
          </h2>
          <AiButton
            hasAiAccess={hasAiAccess}
            onClick={handleGenerateAiSummary}
            loading={generatingAiSummary}
            creditCost={5}
          >
            {aiSummary ? "Regenerate" : "Generate"}
          </AiButton>
        </div>
        {aiSummary ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{aiSummary}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">
            {hasAiAccess
              ? "Generate an AI assessment of this candidate."
              : "Upgrade to Pro to generate AI assessments."}
          </p>
        )}
      </div>

      {/* Applications */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Applications ({candidate.applications.length})
          </h2>
          {!profileComplete && candidate.applications.length > 0 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded px-1.5 py-0.5 leading-tight max-w-[160px] text-right">
              Save {missingProfileFields.join(", ")} to enable scoring
            </p>
          )}
        </div>
        {candidate.applications.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Not applied to any jobs yet</p>
        ) : (
          <div className="space-y-3">
            {candidate.applications.map((app) => (
              <div key={app.id} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 space-y-3">
                {/* Job header */}
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 block"
                    >
                      {app.job.title}
                    </Link>
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-700 font-medium uppercase tracking-wider mt-0.5"
                    >
                      View Kanban <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                  {appScores[app.id] && (
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                        appScores[app.id].score >= 80
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : appScores[app.id].score >= 60
                          ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      )}
                    >
                      <Sparkles className="h-3 w-3" />
                      {appScores[app.id].score}
                    </div>
                  )}
                </div>

                {/* AI feature sections */}
                {hasAiAccess && (
                  <div className="space-y-2">

                    {/* Gap Analysis */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <GitBranch className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Gap Analysis</p>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                            Compare this candidate&apos;s skills against the job requirements to surface matched, partial, and missing competencies.
                          </p>
                        </div>
                        <AiButton
                          hasAiAccess={hasAiAccess}
                          onClick={() => handleSkillsGap(app.id)}
                          loading={gapAppId === app.id}
                          className="text-[10px] h-6 px-2 shrink-0"
                          creditCost={5}
                        >
                          {appGaps[app.id] ? "Re-analyze" : "Analyze"}
                        </AiButton>
                      </div>
                      {appGaps[app.id] && (
                        <div className="mt-2.5 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-2.5">
                          {appGaps[app.id].matched.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-green-600 mb-1">Matched</p>
                              <div className="flex flex-wrap gap-1">
                                {appGaps[app.id].matched.map((s, i) => (
                                  <span key={i} className="rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-[10px] text-green-700 dark:text-green-400">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {appGaps[app.id].partial.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-yellow-600 mb-1">Partial</p>
                              <div className="flex flex-wrap gap-1">
                                {appGaps[app.id].partial.map((s, i) => (
                                  <span key={i} className="rounded-full bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 text-[10px] text-yellow-700 dark:text-yellow-400">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {appGaps[app.id].missing.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-red-500 mb-1">Missing</p>
                              <div className="flex flex-wrap gap-1">
                                {appGaps[app.id].missing.map((s, i) => (
                                  <span key={i} className="rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-0.5 text-[10px] text-red-600 dark:text-red-400">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {appGaps[app.id].developmentPlan && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-2">
                              {appGaps[app.id].developmentPlan}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Interview Questions */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Interview Questions</p>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                            Generate tailored behavioral, technical, and culture-fit questions based on this candidate&apos;s background and the role.
                          </p>
                        </div>
                        <AiButton
                          hasAiAccess={hasAiAccess}
                          onClick={() => handleInterviewQuestions(app.id)}
                          loading={interviewQAppId === app.id}
                          className="text-[10px] h-6 px-2 shrink-0"
                          creditCost={5}
                        >
                          {appInterviewQuestions[app.id] ? "Refresh" : "Generate"}
                        </AiButton>
                      </div>
                      {appInterviewQuestions[app.id] && (
                        <div className="mt-2.5 space-y-2.5 border-t border-gray-100 dark:border-gray-700 pt-2.5">
                          {appInterviewQuestions[app.id].behavioral?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-indigo-600 mb-1">Behavioral</p>
                              <ol className="space-y-1 list-decimal list-inside">
                                {appInterviewQuestions[app.id].behavioral.map((q, i) => (
                                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{q}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {appInterviewQuestions[app.id].technical?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-indigo-600 mb-1">Technical</p>
                              <ol className="space-y-1 list-decimal list-inside">
                                {appInterviewQuestions[app.id].technical.map((q, i) => (
                                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{q}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {appInterviewQuestions[app.id].culture?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-indigo-600 mb-1">Culture Fit</p>
                              <ol className="space-y-1 list-decimal list-inside">
                                {appInterviewQuestions[app.id].culture.map((q, i) => (
                                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{q}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reference Questions */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Briefcase className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Reference Check Questions</p>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                            Generate targeted questions to ask this candidate&apos;s references, covering work style, accomplishments, and potential concerns.
                          </p>
                        </div>
                        <AiButton
                          hasAiAccess={hasAiAccess}
                          onClick={() => handleRefQuestions(app.id)}
                          loading={refQAppId === app.id}
                          className="text-[10px] h-6 px-2 shrink-0"
                          creditCost={3}
                        >
                          {appRefQuestions[app.id] ? "Refresh" : "Generate"}
                        </AiButton>
                      </div>
                      {appRefQuestions[app.id] && appRefQuestions[app.id].length > 0 && (
                        <div className="mt-2.5 border-t border-gray-100 dark:border-gray-700 pt-2.5">
                          <ol className="space-y-1.5 list-decimal list-inside">
                            {appRefQuestions[app.id].map((q, i) => (
                              <li key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{q}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Score results */}
                {appScores[app.id] &&
                  (appScores[app.id].strengths.length > 0 ||
                    appScores[app.id].gaps.length > 0 ||
                    appScores[app.id].recommendation) && (
                    <div className="space-y-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-2.5">
                      {appScores[app.id].recommendation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
                          {appScores[app.id].recommendation}
                        </p>
                      )}
                      {appScores[app.id].strengths.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Strengths</p>
                          <ul className="space-y-0.5">
                            {appScores[app.id].strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {appScores[app.id].gaps.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Gaps</p>
                          <ul className="space-y-0.5">
                            {appScores[app.id].gaps.map((g, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <XCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* Score button */}
                {hasAiAccess && (
                  <div>
                    {profileComplete ? (
                      <AiButton
                        hasAiAccess={hasAiAccess}
                        onClick={() => handleScoreApplication(app.id)}
                        loading={scoringAppId === app.id}
                        className="text-[10px] h-6 px-2"
                        creditCost={5}
                      >
                        {appScores[app.id] ? "Re-score" : "Score"}
                      </AiButton>
                    ) : (
                      <button
                        disabled
                        title={`Profile incomplete — save ${missingProfileFields.join(", ")} first`}
                        className="flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-600 px-2 h-6 text-[10px] text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      >
                        <Sparkles className="h-3 w-3" />
                        Score
                      </button>
                    )}
                  </div>
                )}

                {/* Stage selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Stage</label>
                  <div className="relative">
                    <select
                      value={app.stage.id}
                      disabled={updatingStageId === app.id}
                      onChange={async (e) => {
                        setUpdatingStageId(app.id);
                        try {
                          await moveApplicationStage(app.id, e.target.value);
                        } finally {
                          setUpdatingStageId(null);
                        }
                      }}
                      className="w-full appearance-none rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {app.job.pipeline.stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <div
                        className="h-2 w-2 rounded-full mr-1"
                        style={{
                          backgroundColor:
                            app.job.pipeline.stages.find((s) => s.id === app.stage.id)?.color ??
                            "#ccc",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screening */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Integrity Screening
        </h2>
        {candidate.applications.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">Add candidate to a job to generate screening questions.</p>
        ) : (
          <div className="space-y-3">
            {candidate.applications.map((app) => {
              const screening = screenings[app.id];
              const isGenerating = generatingScreening === app.id;
              const linkCopied = screeningLinkCopied === app.id;
              return (
                <div key={app.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{app.job.title}</p>
                    <div className="flex items-center gap-2">
                      {screening && (
                        <>
                          {screening.flagged && (
                            <span className="rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                              Flagged
                            </span>
                          )}
                          {screening.completedAt && (
                            <span className="rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                              Complete
                            </span>
                          )}
                          <button
                            onClick={() => handleCopyScreeningLink(app.id)}
                            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                          >
                            {linkCopied ? <><CheckCheck className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy Link</>}
                          </button>
                        </>
                      )}
                      <AiButton
                        hasAiAccess={hasAiAccess}
                        onClick={() => handleGenerateScreening(app.id)}
                        loading={isGenerating}
                        creditCost={5}
                      >
                        {screening ? "Regenerate" : "Generate Questions"}
                      </AiButton>
                    </div>
                  </div>
                  {screening && !screening.completedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {screening.questions.length} questions · awaiting candidate responses
                    </p>
                  )}
                  {screening?.flagReason && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2">
                      <p className="text-xs text-red-700 dark:text-red-400">
                        <span className="font-semibold">Flag reason: </span>{screening.flagReason}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );

  // ── Tab content: Communications ───────────────────────────────────────────

  const commsContent = (
    <div>
      <div className="flex items-center justify-between mb-3">
        {hasAiAccess && (
          <AiButton
            hasAiAccess={hasAiAccess}
            onClick={() => {
              setComposeOpen(true);
              setEmailResult(null);
              setEmailContext("");
              setEmailType("outreach");
              setComposeJobId(candidate.applications[0]?.job.id ?? "");
            }}
            loading={false}
            creditCost={5}
            className="text-[10px] h-6 px-2 gap-1 ml-auto"
          >
            <Mail className="h-3 w-3" />
            Compose
          </AiButton>
        )}
      </div>
      {communications.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No communications logged yet</p>
      ) : (
        <div className="space-y-2">
          {communications.map((comm) => {
            const tl = typeLabels[comm.type] ?? { label: comm.type, color: "bg-gray-100 text-gray-600" };
            const isExpanded = expandedCommId === comm.id;
            return (
              <div key={comm.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", tl.color)}>
                        {tl.label}
                      </span>
                      {comm.job && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{comm.job.title}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug truncate">{comm.subject}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(comm.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedCommId(isExpanded ? null : comm.id)}
                      className="text-gray-300 hover:text-gray-600 transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        fetch(`/api/communications/${comm.id}/save-as-template`, { method: "POST" });
                      }}
                      className="text-gray-300 hover:text-indigo-500 transition-colors"
                      title="Save as Template"
                    >
                      <BookMarked className="h-3.5 w-3.5" />
                    </button>
                    {comm.authorId === currentUserId && (
                      <button
                        onClick={() => handleDeleteCommunication(comm.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {comm.body}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Tabbed right panel ────────────────────────────────────────────────────

  const tabs: { key: typeof rightTab; label: string }[] = [
    ...(hasResume ? [{ key: "resume" as const, label: "Resume" }] : []),
    { key: "ai", label: "AI" },
    { key: "interviews", label: "Interviews" },
    { key: "notes", label: "Notes" },
    { key: "comms", label: "Comms" },
  ];

  const tabbedPanel = (
    <div className="sticky top-4 flex flex-col gap-3" style={{ height: "calc(100vh - 80px)" }}>
      {/* Tab bar */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5 gap-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setRightTab(t.key); if (t.key === "interviews") loadInterviews(); }}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              rightTab === t.key
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Resume tab */}
      {rightTab === "resume" && hasResume && (
        <>
          {candidate.resumeExpiresAt && (
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                Resume cleanup scheduled &mdash; will be deleted on{" "}
                <strong>{new Date(candidate.resumeExpiresAt).toLocaleDateString()}</strong>.
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {candidate.linkedinUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a
                href={`/api/candidates/${candidate.id}/resume`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-3.5 w-3.5" />
                Download
              </a>
            </Button>
            <AiButton
              hasAiAccess={hasAiAccess}
              onClick={handleParseResume}
              loading={parsingResume}
              creditCost={10}
            >
              Parse Resume
            </AiButton>
          </div>
          <div className="flex-1 min-h-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
            <iframe
              src={`/api/candidates/${candidate.id}/resume`}
              className="w-full h-full"
              title="Resume preview"
            />
          </div>
        </>
      )}

      {/* AI tab */}
      {rightTab === "ai" && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          {aiContent}
        </div>
      )}

      {/* Interviews tab */}
      {rightTab === "interviews" && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-4">
          {loadingInterviews && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Loading interviews…</p>
          )}

          {/* Schedule new interview */}
          {schedulingAppId ? (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/20 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schedule Interview</p>
              <div className="space-y-2">
                <Input
                  placeholder="Interview title"
                  value={newInterviewForm.title}
                  onChange={(e) => setNewInterviewForm((f) => ({ ...f, title: e.target.value }))}
                  className="text-sm"
                />
                <Input
                  type="datetime-local"
                  value={newInterviewForm.scheduledAt}
                  onChange={(e) => setNewInterviewForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Duration (min)"
                    value={newInterviewForm.duration}
                    onChange={(e) => setNewInterviewForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                    className="text-sm w-32"
                  />
                  <Input
                    placeholder="Meeting link"
                    value={newInterviewForm.meetingLink}
                    onChange={(e) => setNewInterviewForm((f) => ({ ...f, meetingLink: e.target.value }))}
                    className="text-sm flex-1"
                  />
                </div>
                <Textarea
                  placeholder="Notes for interviewer (optional)"
                  value={newInterviewForm.notes}
                  onChange={(e) => setNewInterviewForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleScheduleInterview(schedulingAppId)} disabled={savingInterview}>
                  {savingInterview ? "Saving…" : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSchedulingAppId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidate.applications.map((app) => (
                <Button
                  key={app.id}
                  size="sm"
                  variant="outline"
                  onClick={() => setSchedulingAppId(app.id)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schedule for {app.job.title}
                </Button>
              ))}
            </div>
          )}

          {/* Interview list */}
          {!loadingInterviews && interviews.length === 0 && interviewsLoaded && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No interviews scheduled yet.</p>
          )}
          {interviews.map((interview) => {
            const app = candidate.applications.find((a) => a.id === interview.applicationId);
            const isScorecarding = scorecardInterviewId === interview.id;
            return (
              <div key={interview.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{interview.title}</p>
                    {app && <p className="text-xs text-indigo-500 dark:text-indigo-400">{app.job.title}</p>}
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    interview.status === "COMPLETED" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    interview.status === "CANCELLED" ? "bg-red-50 dark:bg-red-900/30 text-red-500" :
                    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  )}>
                    {interview.status}
                  </span>
                </div>
                {interview.scheduledAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="inline h-3.5 w-3.5 mr-1" />
                    {new Date(interview.scheduledAt).toLocaleString()} · {interview.duration}min
                  </p>
                )}
                {interview.meetingLink && (
                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline block truncate">
                    {interview.meetingLink}
                  </a>
                )}

                {/* Feedbacks */}
                {interview.feedbacks.length > 0 && (
                  <div className="space-y-2">
                    {interview.feedbacks.map((fb) => (
                      <div key={fb.id} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {"★".repeat(fb.overallRating)}{"☆".repeat(5 - fb.overallRating)}
                          </span>
                          <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
                            fb.recommendation.includes("YES") ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            fb.recommendation === "MAYBE" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {fb.recommendation.replace("_", " ")}
                          </span>
                          {fb.aiDrafted && <span className="text-[10px] text-indigo-400 flex items-center gap-0.5"><Sparkles className="h-3 w-3" />AI</span>}
                        </div>
                        {fb.notes && <p className="text-xs text-gray-600 dark:text-gray-400">{fb.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Scorecard */}
                {isScorecarding && (
                  <div className="rounded-lg border border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 space-y-3">
                    {draftingScorecard && <p className="text-xs text-indigo-500 animate-pulse">Drafting scorecard…</p>}
                    {scorecardDraft && (
                      <>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Scorecard Draft</p>
                        <div className="space-y-2">
                          {scorecardDraft.rubricScores.map((rs, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{rs.criterion}</p>
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map((n) => (
                                    <button
                                      key={n}
                                      onClick={() => setScorecardDraft((d) => d ? { ...d, rubricScores: d.rubricScores.map((r, ri) => ri === i ? { ...r, score: n } : r) } : d)}
                                      className={cn("w-5 h-5 rounded text-[10px] font-bold border transition-colors", rs.score >= n ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-300 text-gray-400 hover:border-indigo-300")}
                                    >{n}</button>
                                  ))}
                                </div>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">{rs.notes}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Overall:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((n) => (
                              <button
                                key={n}
                                onClick={() => setScorecardDraft((d) => d ? { ...d, overallRating: n } : d)}
                                className={cn("w-5 h-5 rounded text-[10px] font-bold border transition-colors", (scorecardDraft.overallRating ?? 0) >= n ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-300 text-gray-400 hover:border-indigo-300")}
                              >{n}</button>
                            ))}
                          </div>
                          <select
                            value={scorecardDraft.recommendation}
                            onChange={(e) => setScorecardDraft((d) => d ? { ...d, recommendation: e.target.value } : d)}
                            className="text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1"
                          >
                            {["STRONG_YES","YES","MAYBE","NO","STRONG_NO"].map((r) => (
                              <option key={r} value={r}>{r.replace("_"," ")}</option>
                            ))}
                          </select>
                        </div>
                        <Textarea
                          placeholder="Additional notes…"
                          value={scorecardDraft.notes}
                          onChange={(e) => setScorecardDraft((d) => d ? { ...d, notes: e.target.value } : d)}
                          rows={2}
                          className="text-xs"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSubmitFeedback(interview.id)} disabled={submittingFeedback}>
                            {submittingFeedback ? "Saving…" : "Submit Feedback"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setScorecardInterviewId(null); setScorecardDraft(null); }}>Cancel</Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!isScorecarding && interview.status !== "COMPLETED" && (
                  <AiButton
                    hasAiAccess={hasAiAccess}
                    onClick={() => handleDraftScorecard(interview.id)}
                    loading={draftingScorecard && scorecardInterviewId === interview.id}
                    creditCost={10}
                  >
                    Draft Scorecard
                  </AiButton>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes tab */}
      {rightTab === "notes" && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          {notesContent}
        </div>
      )}

      {/* Comms tab */}
      {rightTab === "comms" && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          {commsContent}
        </div>
      )}

      {/* Add to job + Meta (always visible at bottom) */}
      {unappliedJobs.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shrink-0">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Add to Job
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a job…</option>
              {unappliedJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleAddToJob} disabled={!selectedJobId}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-xs text-gray-400 dark:text-gray-500 shrink-0">
        Added {formatDate(candidate.createdAt)}
      </div>
    </div>
  );


  return (
    <div>
      {/* ── Header bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-sm text-green-600 font-medium">Saved!</span>
          )}
          <Button
            onClick={handleSaveProfile}
            disabled={!formDirty || saving}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* ── Side-by-side layout ─────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_460px] gap-5 items-start">
        <div>{profilePanel}</div>
        <div>{tabbedPanel}</div>
      </div>

      {/* ── Compose Email dialog ─────────────────────────────────── */}
      <Dialog
        open={composeOpen}
        onOpenChange={(open) => {
          if (!open) {
            setComposeOpen(false);
            setEmailResult(null);
            setEmailContext("");
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              Generate a professional email for {candidate.firstName} {candidate.lastName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {candidate.applications.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Job (optional)</label>
                <select
                  value={composeJobId}
                  onChange={(e) => setComposeJobId(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No specific job</option>
                  {candidate.applications.map((app) => (
                    <option key={app.job.id} value={app.job.id}>
                      {app.job.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Email Type</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as EmailType)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="outreach">Outreach</option>
                <option value="interview_invite">Interview Invite</option>
                <option value="follow_up">Follow-up</option>
                <option value="offer">Job Offer</option>
                <option value="rejection">Rejection</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                Additional Context <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
              </label>
              <Textarea
                value={emailContext}
                onChange={(e) => setEmailContext(e.target.value)}
                placeholder="e.g. Interview is on Friday at 2pm via Zoom…"
                rows={2}
                className="text-sm"
              />
            </div>

            {emailResult && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Subject</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{emailResult.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Body</p>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                    {emailResult.body}
                  </pre>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      const full = `Subject: ${emailResult.subject}\n\n${emailResult.body}`;
                      navigator.clipboard.writeText(full);
                      setEmailCopied(true);
                      setTimeout(() => setEmailCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {emailCopied ? (
                      <><CheckCheck className="h-3.5 w-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </button>
                  <button
                    onClick={handleSaveAsTemplate}
                    disabled={savingTemplate}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 font-medium disabled:opacity-50"
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                    {savingTemplate ? "Saving…" : "Save as Template"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            {emailResult && (
              <Button variant="outline" size="sm" onClick={handleLogAndClose}>
                Log & Close
              </Button>
            )}
            {emailType === "rejection" && (() => {
              const scoredApp = candidate.applications.find(
                (a) => a.job.id === composeJobId && appScores[a.id]
              ) ?? candidate.applications.find((a) => appScores[a.id]);
              if (!scoredApp) return null;
              return (
                <AiButton
                  hasAiAccess={hasAiAccess}
                  onClick={() => handleDraftRejection(scoredApp.id)}
                  loading={draftingRejection}
                  creditCost={3}
                >
                  Constructive Rejection
                </AiButton>
              );
            })()}
            <AiButton
              hasAiAccess={hasAiAccess}
              onClick={handleDraftEmail}
              loading={draftingEmail}
              creditCost={5}
            >
              {emailResult ? "Regenerate" : "Generate Email"}
            </AiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
