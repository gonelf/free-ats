"use client";

import { useState } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { PipelineCard } from "./PipelineCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Settings2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  job: { id: string; title: string };
}

interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  stages: Stage[];
  applications: Application[];
  _count: { jobs: number };
}

interface PipelineKanbanClientProps {
  pipelines: Pipeline[];
  hasAiAccess: boolean;
}

export function PipelineKanbanClient({
  pipelines,
  hasAiAccess,
}: PipelineKanbanClientProps) {
  const [view, setView] = useState<"board" | "settings">("board");
  const [selectedPipelineId, setSelectedPipelineId] = useState(
    pipelines.find((p) => p.isDefault)?.id || pipelines[0]?.id
  );

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  if (!selectedPipeline) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No pipelines found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
          <SelectTrigger className="w-[200px] font-semibold">
            <SelectValue placeholder="Select pipeline" />
          </SelectTrigger>
          <SelectContent>
            {pipelines.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{p.name}</span>
                  {p.isDefault && (
                    <span className="ml-2 text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 uppercase font-bold">
                      Default
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              view === "board"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Board view
          </button>
          <button
            onClick={() => setView("settings")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              view === "settings"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {view === "board" ? (
        <div className="min-h-[600px]">
          <KanbanBoard
            stages={selectedPipeline.stages}
            applications={selectedPipeline.applications}
            hasAiAccess={hasAiAccess}
          />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <PipelineCard
            pipeline={selectedPipeline}
          />
        </div>
      )}
    </div>
  );
}
