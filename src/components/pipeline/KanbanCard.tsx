"use client";

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
}

interface KanbanCardProps {
  application: Application;
  isDragging?: boolean;
  isPro: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-700 bg-green-50";
  if (score >= 60) return "text-yellow-700 bg-yellow-50";
  return "text-red-700 bg-red-50";
}

export function KanbanCard({
  application,
  isDragging,
  isPro,
}: KanbanCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm",
        isDragging || isSortableDragging
          ? "opacity-50 shadow-lg"
          : "hover:shadow-md"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <Link
          href={`/candidates/${candidate.id}`}
          className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
        >
          {candidate.firstName} {candidate.lastName}
        </Link>
        <p className="text-xs text-gray-400 truncate mt-0.5">{candidate.email}</p>

        {candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {candidate.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
            {candidate.tags.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                +{candidate.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {isPro && application.aiScore !== null && (
        <div
          className={cn(
            "shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            getScoreColor(application.aiScore)
          )}
        >
          <Sparkles className="h-3 w-3" />
          {application.aiScore}
        </div>
      )}
    </div>
  );
}
