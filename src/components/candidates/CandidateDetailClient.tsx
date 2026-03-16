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

interface CandidateDetailClientProps {
  candidate: Candidate;
  hasAiAccess: boolean;
  currentUserId: string;
  jobs: Array<{ id: string; title: string }>;
}

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
      if (app.aiScore !== null)
        initial[app.id] = { score: app.aiScore, strengths: [], gaps: [], recommendation: "" };
    }
    return initial;
  });

  // ── Email drafting ────────────────────────────────────────────────────────
  const [emailAppId, setEmailAppId] = useState<string | null>(null);
  const [emailType, setEmailType] = useState<EmailType>("outreach");
  const [emailContext, setEmailContext] = useState("");
  const [draftingEmail, setDraftingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ subject: string; body: string } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // ── Skills gap ────────────────────────────────────────────────────────────
  const [gapAppId, setGapAppId] = useState<string | null>(null);
  const [appGaps, setAppGaps] = useState<Record<string, GapResult>>({});

  // ── Reference questions ───────────────────────────────────────────────────
  const [refQAppId, setRefQAppId] = useState<string | null>(null);
  const [appRefQuestions, setAppRefQuestions] = useState<Record<string, string[]>>({});

  // ── Interview questions ───────────────────────────────────────────────────
  const [interviewQAppId, setInterviewQAppId] = useState<string | null>(null);
  const [appInterviewQuestions, setAppInterviewQuestions] = useState<
    Record<string, { behavioral: string[]; technical: string[]; culture: string[] }>
  >({});

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
        setAppScores((prev) => ({ ...prev, [applicationId]: data }));
      }
    } finally {
      setScoringAppId(null);
    }
  }

  async function handleDraftEmail() {
    if (!emailAppId) return;
    setDraftingEmail(true);
    setEmailResult(null);
    try {
      const app = candidate.applications.find((a) => a.id === emailAppId);
      if (!app) return;
      const res = await fetch("/api/ai/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          candidateId: candidate.id,
          jobId: app.job.id,
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

  async function handleSkillsGap(applicationId: string) {
    setGapAppId(applicationId);
    try {
      const app = candidate.applications.find((a) => a.id === applicationId);
      if (!app) return;
      const res = await fetch("/api/ai/skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id, jobId: app.job.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppGaps((prev) => ({ ...prev, [applicationId]: data }));
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
        body: JSON.stringify({ candidateId: candidate.id, jobId: app.job.id }),
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
        body: JSON.stringify({ candidateId: candidate.id, jobId: app.job.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppInterviewQuestions((prev) => ({ ...prev, [applicationId]: data }));
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

  const profilePanel = (
    <div className="space-y-5">
      {/* ── Parse banner ─────────────────────────────────────────── */}
      {parseSuccess && (
        <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2.5">
          <p className="text-sm text-indigo-700 font-medium">
            Resume parsed — review the fields below and save.
          </p>
          <button onClick={() => setParseSuccess(false)}>
            <X className="h-4 w-4 text-indigo-400" />
          </button>
        </div>
      )}
      {parseError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5">
          <p className="text-sm text-red-700">{parseError}</p>
        </div>
      )}

      {/* ── Contact ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Contact
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">First Name</label>
            <Input
              value={form.firstName}
              onChange={(e) => patchForm("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
            <Input
              value={form.lastName}
              onChange={(e) => patchForm("lastName", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => patchForm("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => patchForm("phone", e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">LinkedIn URL</label>
            <Input
              value={form.linkedinUrl}
              onChange={(e) => patchForm("linkedinUrl", e.target.value)}
              placeholder="—"
            />
          </div>
        </div>
      </div>

      {/* ── Professional Summary ─────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Professional Summary
        </h2>
        <Textarea
          value={form.summary}
          onChange={(e) => patchForm("summary", e.target.value)}
          placeholder="A brief professional summary…"
          rows={4}
        />
      </div>

      {/* ── Skills ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skills</h2>
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
              className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
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
      </div>

      {/* ── Work Experience ──────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
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
            <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
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
                      <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                      <p className="text-xs text-gray-500">
                        {exp.company}
                        {(exp.startDate || exp.endDate) && (
                          <span className="ml-1 text-gray-400">
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
                    <p className="mt-1.5 text-xs text-gray-600 leading-relaxed line-clamp-3">
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
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 space-y-2">
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
      </div>

      {/* ── Achievements ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Achievements
        </h2>
        <ul className="space-y-1.5 mb-3">
          {form.achievements.map((a, idx) => (
            <li key={idx} className="flex items-start gap-2 group">
              <Trophy className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span className="flex-1 text-sm text-gray-700">{a}</span>
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
      </div>

      {/* ── AI Assessment ────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            AI Assessment
          </h2>
          <AiButton
            hasAiAccess={hasAiAccess}
            onClick={handleGenerateAiSummary}
            loading={generatingAiSummary}
          >
            {aiSummary ? "Regenerate" : "Generate"}
          </AiButton>
        </div>
        {aiSummary ? (
          <p className="text-sm text-gray-600 leading-relaxed">{aiSummary}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">
            {hasAiAccess
              ? "Generate an AI assessment of this candidate."
              : "Upgrade to Pro to generate AI assessments."}
          </p>
        )}
      </div>

      {/* ── Notes ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</h2>
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
        </div>
        {candidate.notes.length > 0 ? (
          <div className="space-y-3">
            {candidate.notes.map((n) => (
              <div key={n.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="text-gray-700 whitespace-pre-wrap">{n.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
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

      {/* ── Applications ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Applications ({candidate.applications.length})
          </h2>
          {!profileComplete && candidate.applications.length > 0 && (
            <p className="text-[10px] text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 leading-tight max-w-[160px] text-right">
              Save {missingProfileFields.join(", ")} to enable scoring
            </p>
          )}
        </div>
        {candidate.applications.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Not applied to any jobs yet</p>
        ) : (
          <div className="space-y-3">
            {candidate.applications.map((app) => (
              <div key={app.id} className="rounded-lg bg-gray-50 p-3 space-y-3">
                {/* Job header */}
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-600 block"
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
                          ? "bg-green-50 text-green-700"
                          : appScores[app.id].score >= 60
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
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

                    {/* ── Gap Analysis ─────────────────────────────── */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <GitBranch className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <p className="text-xs font-semibold text-gray-800">Gap Analysis</p>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug">
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
                        <div className="mt-2.5 space-y-2 border-t border-gray-100 pt-2.5">
                          {appGaps[app.id].matched.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-green-600 mb-1">Matched</p>
                              <div className="flex flex-wrap gap-1">
                                {appGaps[app.id].matched.map((s, i) => (
                                  <span key={i} className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-700">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {appGaps[app.id].partial.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-yellow-600 mb-1">Partial</p>
                              <div className="flex flex-wrap gap-1">
                                {appGaps[app.id].partial.map((s, i) => (
                                  <span key={i} className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] text-yellow-700">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {appGaps[app.id].missing.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-red-500 mb-1">Missing</p>
                              <div className="flex flex-wrap gap-1">
                                {appGaps[app.id].missing.map((s, i) => (
                                  <span key={i} className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-600">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {appGaps[app.id].developmentPlan && (
                            <p className="text-xs text-gray-600 italic leading-relaxed border-t border-gray-100 pt-2">
                              {appGaps[app.id].developmentPlan}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Interview Questions ───────────────────────── */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <p className="text-xs font-semibold text-gray-800">Interview Questions</p>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug">
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
                        <div className="mt-2.5 space-y-2.5 border-t border-gray-100 pt-2.5">
                          {appInterviewQuestions[app.id].behavioral?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-indigo-600 mb-1">Behavioral</p>
                              <ol className="space-y-1 list-decimal list-inside">
                                {appInterviewQuestions[app.id].behavioral.map((q, i) => (
                                  <li key={i} className="text-xs text-gray-700 leading-relaxed">{q}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {appInterviewQuestions[app.id].technical?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-indigo-600 mb-1">Technical</p>
                              <ol className="space-y-1 list-decimal list-inside">
                                {appInterviewQuestions[app.id].technical.map((q, i) => (
                                  <li key={i} className="text-xs text-gray-700 leading-relaxed">{q}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {appInterviewQuestions[app.id].culture?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-indigo-600 mb-1">Culture Fit</p>
                              <ol className="space-y-1 list-decimal list-inside">
                                {appInterviewQuestions[app.id].culture.map((q, i) => (
                                  <li key={i} className="text-xs text-gray-700 leading-relaxed">{q}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Reference Questions ───────────────────────── */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Briefcase className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <p className="text-xs font-semibold text-gray-800">Reference Check Questions</p>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug">
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
                        <div className="mt-2.5 border-t border-gray-100 pt-2.5">
                          <ol className="space-y-1.5 list-decimal list-inside">
                            {appRefQuestions[app.id].map((q, i) => (
                              <li key={i} className="text-xs text-gray-700 leading-relaxed">{q}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>

                    {/* ── Draft Email ───────────────────────────────── */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <p className="text-xs font-semibold text-gray-800">Draft Email</p>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug">
                            Compose a professional outreach, interview invite, offer, follow-up, or rejection email tailored to this candidate.
                          </p>
                        </div>
                        <AiButton
                          hasAiAccess={hasAiAccess}
                          onClick={() => {
                            setEmailAppId(app.id);
                            setEmailResult(null);
                            setEmailContext("");
                            setEmailType("outreach");
                          }}
                          loading={false}
                          className="text-[10px] h-6 px-2 shrink-0"
                          creditCost={5}
                        >
                          Compose
                        </AiButton>
                      </div>
                    </div>

                  </div>
                )}

                {/* Score results (shown outside sections since score badge is in header) */}
                {appScores[app.id] &&
                  (appScores[app.id].strengths.length > 0 ||
                    appScores[app.id].gaps.length > 0 ||
                    appScores[app.id].recommendation) && (
                    <div className="space-y-2 rounded-lg bg-white border border-gray-100 p-2.5">
                      {appScores[app.id].recommendation && (
                        <p className="text-xs text-gray-600 italic leading-relaxed">
                          {appScores[app.id].recommendation}
                        </p>
                      )}
                      {appScores[app.id].strengths.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Strengths</p>
                          <ul className="space-y-0.5">
                            {appScores[app.id].strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {appScores[app.id].gaps.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Gaps</p>
                          <ul className="space-y-0.5">
                            {appScores[app.id].gaps.map((g, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <XCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* Score button + Stage selector */}
                <div className="space-y-2">
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
                          className="flex items-center gap-1 rounded-md border border-gray-200 px-2 h-6 text-[10px] text-gray-300 cursor-not-allowed"
                        >
                          <Sparkles className="h-3 w-3" />
                          Score
                        </button>
                      )}
                    </div>
                  )}
                </div>

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
                      className="w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
    </div>
  );

  const resumePanel = (
    <div className="sticky top-4 flex flex-col gap-3" style={{ height: "calc(100vh - 80px)" }}>
      {/* Actions row */}
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

      {/* PDF iframe */}
      <div className="flex-1 min-h-0 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
        <iframe
          src={`/api/candidates/${candidate.id}/resume`}
          className="w-full h-full"
          title="Resume preview"
        />
      </div>

      {/* Add to job */}
      {unappliedJobs.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Add to Job
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900"
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
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-400">
        Added {formatDate(candidate.createdAt)}
      </div>
    </div>
  );

  const noResumePanel = (
    <div className="space-y-5">
      {/* Add to job */}
      {unappliedJobs.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Add to Job</h3>
          <div className="flex gap-2">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900"
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
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <p className="text-sm text-gray-400">Added {formatDate(candidate.createdAt)}</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Header bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="text-sm text-gray-500">{candidate.email}</p>
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

      {/* ── Side-by-side or single-column ───────────────────────── */}
      {hasResume ? (
        <div className="grid grid-cols-[1fr_460px] gap-5 items-start">
          <div>{profilePanel}</div>
          <div>{resumePanel}</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5 items-start">
          <div className="col-span-2">{profilePanel}</div>
          <div>{noResumePanel}</div>
        </div>
      )}

      {/* ── Email draft dialog ───────────────────────────────────── */}
      <Dialog
        open={!!emailAppId}
        onOpenChange={(open) => {
          if (!open) {
            setEmailAppId(null);
            setEmailResult(null);
            setEmailContext("");
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Draft Email</DialogTitle>
            <DialogDescription>
              Generate a professional email for {candidate.firstName}{" "}
              {candidate.lastName} regarding{" "}
              {candidate.applications.find((a) => a.id === emailAppId)?.job.title ?? "this role"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email Type</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as EmailType)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="outreach">Outreach</option>
                <option value="interview_invite">Interview Invite</option>
                <option value="follow_up">Follow-up</option>
                <option value="offer">Job Offer</option>
                <option value="rejection">Rejection</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Additional Context <span className="text-gray-400 font-normal">(optional)</span>
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
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Subject</p>
                  <p className="text-sm font-medium text-gray-900">{emailResult.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Body</p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                    {emailResult.body}
                  </pre>
                </div>
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
                    <>
                      <CheckCheck className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy to clipboard
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <DialogFooter>
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
