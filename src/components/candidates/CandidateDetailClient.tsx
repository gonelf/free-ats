"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ExternalLink, FileText, Sparkles, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AiButton } from "@/components/ai/AiGate";
import { addNote, deleteNote, addCandidateToJob } from "@/app/actions";
import { formatDate } from "@/lib/utils";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  tags: string[];
  createdAt: Date;
  notes: Array<{ id: string; content: string; authorId: string; createdAt: Date }>;
  aiSummary: { summary: string; createdAt: Date } | null;
  applications: Array<{
    id: string;
    aiScore: number | null;
    job: { id: string; title: string; status: string };
    stage: { name: string; color: string };
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

  const unappliedJobs = jobs.filter(
    (j) => !candidate.applications.find((a) => a.job.id === j.id)
  );

  return (
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
            <div className="flex gap-2">
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
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3.5 w-3.5" />
                    Resume
                  </a>
                </Button>
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
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm mb-2"
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
            <div className="space-y-2">
              {candidate.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div>
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="text-xs font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {app.job.title}
                    </Link>
                    <div
                      className="flex items-center gap-1 mt-0.5"
                    >
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: app.stage.color }}
                      />
                      <span className="text-xs text-gray-500">
                        {app.stage.name}
                      </span>
                    </div>
                  </div>
                  {hasAiAccess && app.aiScore !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      <span className="font-medium">{app.aiScore}</span>
                    </div>
                  )}
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
  );
}
