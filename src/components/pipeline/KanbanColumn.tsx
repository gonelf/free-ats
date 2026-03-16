"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";

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

interface KanbanColumnProps {
  stage: Stage;
  applications: Application[];
  jobId?: string;
  hasAiAccess: boolean;
}

export function KanbanColumn({
  stage,
  applications,
  jobId,
  hasAiAccess,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-sm font-medium text-gray-700">{stage.name}</span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          {applications.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-3 rounded-2xl min-h-[500px] p-3 transition-all duration-200 border-2 border-transparent",
          isOver 
            ? "bg-indigo-50/50 border-indigo-200 ring-4 ring-indigo-50/30" 
            : "bg-gray-50/50 border-gray-100"
        )}
      >
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              hasAiAccess={hasAiAccess}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-white/50">
            <p className="text-xs font-medium text-gray-400">Drop candidates here</p>
          </div>
        )}
      </div>
    </div>
  );
}
