"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { GripVertical, Sparkles, TrendingUp, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreSummary {
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

interface Application {
  id: string;
  stageId: string;
  aiScore: number | null;
  aiScoreSummary?: ScoreSummary | null;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    tags: string[];
  };
  job?: { title: string };
}

interface KanbanCardProps {
  application: Application;
  isDragging?: boolean;
  hasAiAccess: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
  if (score >= 60) return "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
  return "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
}

export function KanbanCard({
  application,
  isDragging,
  hasAiAccess,
}: KanbanCardProps) {
  const [score, setScore] = useState<number | null>(application.aiScore);
  const [summary, setSummary] = useState<ScoreSummary | null>(
    application.aiScoreSummary ?? null
  );
  const [scoring, setScoring] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { candidate } = application;
  const isCurrentlyDragging = isDragging || isSortableDragging;

  async function handleScore(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (scoring || !hasAiAccess) return;
    setScoring(true);
    try {
      const res = await fetch("/api/ai/score-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        if (data.strengths && data.gaps && data.recommendation) {
          setSummary({
            strengths: data.strengths,
            gaps: data.gaps,
            recommendation: data.recommendation,
          });
        }
      }
    } finally {
      setScoring(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-start gap-4 rounded-xl border bg-white dark:bg-gray-800 p-4 transition-all duration-200 cursor-grab active:cursor-grabbing",
        isCurrentlyDragging
          ? "opacity-50 shadow-2xl ring-2 ring-indigo-500 border-indigo-500 scale-[1.02] z-50"
          : "border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-600 hover:-translate-y-0.5"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link
            href={`/candidates/${candidate.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
          >
            {candidate.firstName} {candidate.lastName}
          </Link>

          {hasAiAccess && score !== null ? (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (summary) setShowSummary((v) => !v);
                else handleScore(e);
              }}
              disabled={scoring}
              title={summary ? "Toggle score summary" : "Re-score candidate"}
              className={cn(
                "shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-75",
                getScoreColor(score)
              )}
            >
              <Sparkles className="h-3 w-3" />
              {scoring ? "…" : score}
            </button>
          ) : hasAiAccess ? (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleScore}
              disabled={scoring}
              title="Score this candidate against the job"
              className="shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {scoring ? "Scoring…" : "Score"}
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{candidate.email}</p>
          {application.job && (
            <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 truncate uppercase tracking-widest bg-indigo-50/50 dark:bg-indigo-900/20 w-fit px-1.5 py-0.5 rounded">
              {application.job.title}
            </p>
          )}
        </div>

        {candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {candidate.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100/80 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600"
              >
                {tag}
              </span>
            ))}
            {candidate.tags.length > 3 && (
              <span className="rounded-full bg-gray-50 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-600">
                +{candidate.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* AI Score Summary Panel */}
        {showSummary && summary && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 space-y-2 text-xs"
          >
            {summary.strengths.length > 0 && (
              <div className="flex gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400 mb-0.5">Match</p>
                  <ul className="space-y-0.5 text-gray-600 dark:text-gray-300">
                    {summary.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {summary.gaps.length > 0 && (
              <div className="flex gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Gaps</p>
                  <ul className="space-y-0.5 text-gray-600 dark:text-gray-300">
                    {summary.gaps.map((g, i) => (
                      <li key={i}>• {g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {summary.recommendation && (
              <div className="flex gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-indigo-700 dark:text-indigo-400 mb-0.5">Recommendation</p>
                  <p className="text-gray-600 dark:text-gray-300">{summary.recommendation}</p>
                </div>
              </div>
            )}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleScore(e); }}
              disabled={scoring}
              className="text-[10px] text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {scoring ? "Re-scoring…" : "Re-score →"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-0.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
}
