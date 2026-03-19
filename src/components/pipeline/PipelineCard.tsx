"use client";

import { useState } from "react";
import { GitBranch, MoreVertical, Plus, Trash2, Edit2, Check, X, GripVertical, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updatePipeline,
  deletePipeline,
  setDefaultPipeline,
  addStage,
  updateStage,
  deleteStage,
  reorderStages,
} from "@/app/actions";
import { cn } from "@/lib/utils";

interface Stage {
  id: string;
  name: string;
  order: number;
  color: string;
}

interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  stages: Stage[];
  jobs?: Array<{ id: string; title: string }>;
  _count: { jobs: number };
}

export function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [pipelineName, setPipelineName] = useState(pipeline.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageName, setEditingStageName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateName = async () => {
    if (pipelineName.trim() === "" || pipelineName === pipeline.name) {
      setIsEditingName(false);
      setPipelineName(pipeline.name);
      return;
    }
    await updatePipeline(pipeline.id, pipelineName);
    setIsEditingName(false);
  };

  const handleDeletePipeline = async () => {
    setIsDeleting(true);
    try {
      await deletePipeline(pipeline.id);
    } catch (error: any) {
      alert(error.message || "Failed to delete pipeline");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    await addStage(pipeline.id, newStageName);
    setNewStageName("");
  };

  const handleUpdateStage = async (stageId: string) => {
    if (!editingStageName.trim()) return;
    await updateStage(stageId, { name: editingStageName });
    setEditingStageId(null);
  };

  const moveStage = async (index: number, direction: "up" | "down") => {
    const newStages = [...pipeline.stages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStages.length) return;

    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    await reorderStages(pipeline.id, newStages.map(s => s.id));
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-2 text-indigo-600 dark:text-indigo-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={pipelineName}
                    onChange={(e) => setPipelineName(e.target.value)}
                    className="h-8 w-[200px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateName();
                      if (e.key === "Escape") {
                        setIsEditingName(false);
                        setPipelineName(pipeline.name);
                      }
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleUpdateName}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={() => {
                    setIsEditingName(false);
                    setPipelineName(pipeline.name);
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pipeline.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-3 w-3 text-gray-400" />
                  </Button>
                  {pipeline.isDefault && (
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100">
                      Default
                    </Badge>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Used in {pipeline._count.jobs} job{pipeline._count.jobs !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!pipeline.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDefaultPipeline(pipeline.id)}
              >
                Set as Default
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={pipeline.isDefault || pipeline._count.jobs > 0}
              title={pipeline.isDefault ? "Default pipeline cannot be deleted" : pipeline._count.jobs > 0 ? "Pipeline in use cannot be deleted" : "Delete pipeline"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="p-4 sm:p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Pipeline Stages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {pipeline.stages.map((stage, index) => (
            <div
              key={stage.id}
              className="group flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                {editingStageId === stage.id ? (
                  <Input
                    value={editingStageName}
                    onChange={(e) => setEditingStageName(e.target.value)}
                    className="h-7 w-full text-sm py-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateStage(stage.id);
                      if (e.key === "Escape") setEditingStageId(null);
                    }}
                    onBlur={() => handleUpdateStage(stage.id)}
                  />
                ) : (
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stage.name}
                  </span>
                )}
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-400 hover:text-indigo-600"
                    onClick={() => moveStage(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-400 hover:text-indigo-600"
                    onClick={() => moveStage(index, "down")}
                    disabled={index === pipeline.stages.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                  onClick={() => {
                    setEditingStageId(stage.id);
                    setEditingStageName(stage.name);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                  onClick={() => deleteStage(stage.id)}
                  disabled={pipeline.stages.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Stage Form */}
          <form onSubmit={handleAddStage} className="flex gap-2">
            <Input
              placeholder="Next stage..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="h-10 text-sm"
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {pipeline.jobs && pipeline.jobs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Active Jobs Using This Pipeline</h4>
            <div className="flex flex-wrap gap-2">
              {pipeline.jobs.map((job) => (
                <Button key={job.id} variant="outline" size="sm" asChild className="h-8 text-xs">
                  <a href={`/jobs/${job.id}`}>
                    <ExternalLink className="h-3 w-3 mr-1.5 text-indigo-500" />
                    {job.title}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pipeline</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the pipeline "{pipeline.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePipeline} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Pipeline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
