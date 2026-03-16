"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Sparkles, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { AiButton } from "@/components/ai/AiGate";
import { addNote, deleteNote, addCandidateToJob, moveApplicationStage, updateCandidateFromResume } from "@/app/actions";
import { formatDate, cn } from "@/lib/utils";

interface ScoringResult {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
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

export function CandidateDetailClient({
  candidate,
  hasAiAccess,
  currentUserId,
  jobs,
}: CandidateDetailClientProps) {
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [summary, setSummary] = useState(candidate.aiSummary?.summary || "");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
  const [scoringAppId, setScoringAppId] = useState<string | null>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parseDialogOpen, setParseDialogOpen] = useState(false);
  const [parseError, setParseError] = useState("");
  const [parsedFields, setParsedFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
  });
  const [applyingParsed, setApplyingParsed] = useState(false);
  const [appScores, setAppScores] = useState<Record<string, ScoringResult>>(() => {
    const initial: Record<string, ScoringResult> = {};
    for (const app of candidate.applications) {
      if (app.aiScore !== null) {
        initial[app.id] = { score: app.aiScore, strengths: [], gaps: [], recommendation: "" };
      }
    }
    return initial;
  });

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

  async function handleGenerateSummary() {
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } finally {
      setGeneratingSummary(false);
    }
  }

  async function handleAddToJob() {
    if (!selectedJobId) return;
    await addCandidateToJob(candidate.id, selectedJobId);
    setSelectedJobId("");
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

  async function handleParseResume() {
    setParsingResume(true);
    setParseError("");
    try {
      const res = await fetch("/api/ai/parse-resume-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        setParseError(err.error || "Failed to parse resume");
        return;
      }
      const data = await res.json();
      setParsedFields({
        firstName: data.firstName || candidate.firstName,
        lastName: data.lastName || candidate.lastName,
        email: data.email || candidate.email,
        phone: data.phone || candidate.phone || "",
        linkedinUrl: data.linkedinUrl || candidate.linkedinUrl || "",
      });
      setParseDialogOpen(true);
    } finally {
      setParsingResume(false);
    }
  }

  async function handleApplyParsed() {
    setApplyingParsed(true);
    try {
      await updateCandidateFromResume(candidate.id, parsedFields);
      setParseDialogOpen(false);
    } finally {
      setApplyingParsed(false);
    }
  }

  const unappliedJobs = jobs.filter(
    (j) => !candidate.applications.find((a) => a.job.id === j.id)
  );

  return (
    <>
    <Dialog open={parseDialogOpen} onOpenChange={setParseDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resume Parsed</DialogTitle>
          <DialogDescription>
            Review and edit the extracted information before applying it to the profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">First Name</label>
              <Input
                value={parsedFields.firstName}
                onChange={(e) => setParsedFields((p) => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Last Name</label>
              <Input
                value={parsedFields.lastName}
                onChange={(e) => setParsedFields((p) => ({ ...p, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <Input
              value={parsedFields.email}
              onChange={(e) => setParsedFields((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
            <Input
              value={parsedFields.phone}
              onChange={(e) => setParsedFields((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">LinkedIn URL</label>
            <Input
              value={parsedFields.linkedinUrl}
              onChange={(e) => setParsedFields((p) => ({ ...p, linkedinUrl: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setParseDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyParsed} disabled={applyingParsed}>
            {applyingParsed ? "Applying..." : "Apply to Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div className="grid grid-cols-3 gap-6">
      {/* Left column - main info */}
      <div className="col-span-2 space-y-6">
        {/* Profile card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-gray-500 mt-0.5">{candidate.email}</p>
              {candidate.phone && (
                <p className="text-gray-500 text-sm">{candidate.phone}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {candidate.linkedinUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {candidate.resumeUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/candidates/${candidate.id}/resume`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Resume
                    {candidate.resumeExpiresAt && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (expires {formatDate(candidate.resumeExpiresAt)})
                      </span>
                    )}
                  </a>
                </Button>
              )}
              {candidate.resumeUrl && (
                <AiButton
                  hasAiAccess={hasAiAccess}
                  onClick={handleParseResume}
                  loading={parsingResume}
                >
                  Parse Resume
                </AiButton>
              )}
            </div>
          </div>

          {candidate.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {candidate.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {parseError && (
            <p className="mt-2 text-sm text-red-600">{parseError}</p>
          )}
        </div>

        {/* AI Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">AI Summary</h2>
            <AiButton
              hasAiAccess={hasAiAccess}
              onClick={handleGenerateSummary}
              loading={generatingSummary}
            >
              {summary ? "Regenerate" : "Generate Summary"}
            </AiButton>
          </div>
          {summary ? (
            <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {hasAiAccess
                ? "Click Generate to create an AI summary of this candidate."
                : "Upgrade to Pro to generate AI summaries."}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>

          <div className="space-y-2 mb-4">
            <Textarea
              placeholder="Add a note about this candidate..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!note.trim() || addingNote}
            >
              {addingNote ? "Adding..." : "Add Note"}
            </Button>
          </div>

          {candidate.notes.length > 0 ? (
            <div className="space-y-3">
              {candidate.notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg bg-gray-50 p-4 text-sm"
                >
                  <p className="text-gray-700 whitespace-pre-wrap">{n.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(n.createdAt)}
                    </span>
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
            <p className="text-sm text-gray-400 italic">No notes yet</p>
          )}
        </div>
      </div>

      {/* Right column - sidebar */}
      <div className="space-y-6">
        {/* Add to job */}
        {unappliedJobs.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Add to Job
            </h3>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 mb-2"
            >
              <option value="">Select a job...</option>
              {unappliedJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              className="w-full"
              onClick={handleAddToJob}
              disabled={!selectedJobId}
            >
              <Plus className="h-3.5 w-3.5" />
              Add to Pipeline
            </Button>
          </div>
        )}

        {/* Applications */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Active Applications ({candidate.applications.length})
          </h3>
          {candidate.applications.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Not applied to any jobs yet
            </p>
          ) : (
            <div className="space-y-3">
              {candidate.applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link
                        href={`/jobs/${app.job.id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-indigo-600 block"
                      >
                        {app.job.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Link
                          href={`/jobs/${app.job.id}`}
                          className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-700 font-medium uppercase tracking-wider"
                        >
                          View Kanban <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    </div>
                    {hasAiAccess && (
                      <div className="flex flex-col items-end gap-1">
                        {appScores[app.id] ? (
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
                        ) : null}
                        <AiButton
                          hasAiAccess={hasAiAccess}
                          onClick={() => handleScoreApplication(app.id)}
                          loading={scoringAppId === app.id}
                          className="text-[10px] h-6 px-2"
                        >
                          {appScores[app.id] ? "Re-score" : "Score"}
                        </AiButton>
                      </div>
                    )}
                  </div>

                  {appScores[app.id] && (appScores[app.id].strengths.length > 0 || appScores[app.id].gaps.length > 0 || appScores[app.id].recommendation) && (
                    <div className="mb-3 space-y-2 rounded-lg bg-white border border-gray-100 p-3">
                      {appScores[app.id].recommendation && (
                        <p className="text-xs text-gray-600 italic leading-relaxed">{appScores[app.id].recommendation}</p>
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

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stage</label>
                    <div className="relative">
                      <select
                        value={app.stage.id}
                        disabled={updatingStageId === app.id}
                        onChange={async (e) => {
                          const newStageId = e.target.value;
                          setUpdatingStageId(app.id);
                          try {
                            await moveApplicationStage(app.id, newStageId);
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
                              app.job.pipeline.stages.find((s) => s.id === app.stage.id)?.color ||
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

        {/* Meta */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-400">Added</dt>
              <dd className="text-gray-700">{formatDate(candidate.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    </>
  );
}
