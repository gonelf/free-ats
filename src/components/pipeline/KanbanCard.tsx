"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { GripVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  stageId: string;
  aiScore: number | null;
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
  if (score >= 80) return "text-green-700 bg-green-50";
  if (score >= 60) return "text-yellow-700 bg-yellow-50";
  return "text-red-700 bg-red-50";
}

export function KanbanCard({
  application,
  isDragging,
  hasAiAccess,
}: KanbanCardProps) {
  const [score, setScore] = useState<number | null>(application.aiScore);
  const [scoring, setScoring] = useState(false);

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
        "group flex items-start gap-4 rounded-xl border bg-white p-4 transition-all duration-200 cursor-grab active:cursor-grabbing",
        isCurrentlyDragging
          ? "opacity-50 shadow-2xl ring-2 ring-indigo-500 border-indigo-500 scale-[1.02] z-50"
          : "border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link
            href={`/candidates/${candidate.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate block transition-colors"
          >
            {candidate.firstName} {candidate.lastName}
          </Link>

          {hasAiAccess && score !== null ? (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleScore}
              disabled={scoring}
              title="Re-score candidate"
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
              className="shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {scoring ? "Scoring…" : "Score"}
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 truncate">{candidate.email}</p>
          {application.job && (
            <p className="text-[10px] font-bold text-indigo-500 truncate uppercase tracking-widest bg-indigo-50/50 w-fit px-1.5 py-0.5 rounded">
              {application.job.title}
            </p>
          )}
        </div>

        {candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {candidate.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100/80 px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200/50"
              >
                {tag}
              </span>
            ))}
            {candidate.tags.length > 3 && (
              <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-400 border border-gray-100">
                +{candidate.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-0.5 text-gray-300 group-hover:text-gray-400 transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
}
