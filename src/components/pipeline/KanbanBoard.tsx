"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Link from "next/link";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

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
}

interface KanbanBoardProps {
  stages: Stage[];
  applications: Application[];
  jobId?: string;
  hasAiAccess: boolean;
}

const REJECTION_STAGE_NAMES = ["rejected", "declined", "not a fit", "no hire"];

function isRejectionStage(stageName: string) {
  return REJECTION_STAGE_NAMES.some((n) => stageName.toLowerCase().includes(n));
}

export function KanbanBoard({
  stages,
  applications: initialApplications,
  jobId,
  hasAiAccess,
}: KanbanBoardProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [rejectionPrompt, setRejectionPrompt] = useState<{
    applicationId: string;
    candidateName: string;
    candidateId: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function onDragStart({ active }: DragStartEvent) {
    const app = applications.find((a) => a.id === active.id);
    if (app) setActiveApp(app);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeApp = applications.find((a) => a.id === activeId);
    if (!activeApp) return;

    // Dropped over a stage column
    const overStage = stages.find((s) => s.id === overId);
    if (overStage && activeApp.stageId !== overId) {
      setApplications((apps) =>
        apps.map((a) =>
          a.id === activeId ? { ...a, stageId: overId } : a
        )
      );
    }
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveApp(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const app = applications.find((a) => a.id === activeId);
    if (!app) return;

    const targetStageId =
      stages.find((s) => s.id === overId)?.id ||
      applications.find((a) => a.id === overId)?.stageId;

    if (!targetStageId || targetStageId === app.stageId) return;

    // Optimistic update already done in onDragOver
    // Now persist to server
    try {
      await fetch(`/api/applications/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: targetStageId }),
      });

      // Show rejection prompt if moved to a rejection-named stage
      const targetStage = stages.find((s) => s.id === targetStageId);
      if (targetStage && isRejectionStage(targetStage.name) && hasAiAccess) {
        const movedApp = applications.find((a) => a.id === activeId);
        if (movedApp) {
          setRejectionPrompt({
            applicationId: activeId,
            candidateName: `${movedApp.candidate.firstName} ${movedApp.candidate.lastName}`,
            candidateId: movedApp.candidate.id,
          });
        }
      }
    } catch {
      // Revert on error
      setApplications(initialApplications);
    }
  }

  const appsByStage = stages.reduce<Record<string, Application[]>>(
    (acc, stage) => {
      acc[stage.id] = applications.filter((a) => a.stageId === stage.id);
      return acc;
    },
    {}
  );

  return (
    <>
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-8 items-start scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            applications={appsByStage[stage.id] || []}
            jobId={jobId}
            hasAiAccess={hasAiAccess}
          />
        ))}
        {/* Spacer to ensure last column isn't cut off */}
        <div className="w-4 shrink-0" />
      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeApp && (
          <div className="rotate-2">
            <KanbanCard
              application={activeApp}
              isDragging
              hasAiAccess={hasAiAccess}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>

    {/* Rejection prompt toast */}
    {rejectionPrompt && (
      <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 shadow-xl p-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Send rejection to {rejectionPrompt.candidateName}?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Generate a constructive, AI-personalized rejection email.
            </p>
          </div>
          <button
            onClick={() => setRejectionPrompt(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Link
            href={`/candidates/${rejectionPrompt.candidateId}?compose=rejection&applicationId=${rejectionPrompt.applicationId}`}
            onClick={() => setRejectionPrompt(null)}
            className="flex-1 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 text-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            Open & Draft Email
          </Link>
          <button
            onClick={() => setRejectionPrompt(null)}
            className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    )}
    </>
  );
}
