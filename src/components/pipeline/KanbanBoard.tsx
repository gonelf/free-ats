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
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

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

interface KanbanBoardProps {
  stages: Stage[];
  applications: Application[];
  jobId: string;
  hasAiAccess: boolean;
}

export function KanbanBoard({
  stages,
  applications: initialApplications,
  jobId,
  hasAiAccess,
}: KanbanBoardProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [activeApp, setActiveApp] = useState<Application | null>(null);

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
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            applications={appsByStage[stage.id] || []}
            jobId={jobId}
            hasAiAccess={hasAiAccess}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp && (
          <KanbanCard
            application={activeApp}
            isDragging
            hasAiAccess={hasAiAccess}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
