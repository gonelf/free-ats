"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronUp, X, Briefcase, Users, GitBranch, Sparkles } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description: string;
  href: string;
  done: boolean;
  icon: React.ReactNode;
}

interface OnboardingChecklistProps {
  hasJob: boolean;
  hasCandidate: boolean;
  hasPipelineMove: boolean;
  isPro: boolean;
}

export function OnboardingChecklist({
  hasJob,
  hasCandidate,
  hasPipelineMove,
  isPro,
}: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const steps: Step[] = [
    {
      id: "job",
      label: "Create your first job",
      description: "Post a job to start building your candidate pipeline.",
      href: "/jobs/new",
      done: hasJob,
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      id: "candidate",
      label: "Add your first candidate",
      description: "Add a candidate manually or upload a resume.",
      href: "/candidates/new",
      done: hasCandidate,
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "pipeline",
      label: "Move a candidate through the pipeline",
      description: "Drag a candidate card to the next stage on the kanban board.",
      href: "/jobs",
      done: hasPipelineMove,
      icon: <GitBranch className="h-4 w-4" />,
    },
    {
      id: "upgrade",
      label: "Try an AI feature",
      description: "Score a candidate, parse a resume, or generate a job description with AI.",
      href: "/candidates",
      done: isPro,
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (dismissed || allDone) return null;

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {completedCount}/{steps.length}
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Getting started
            </p>
            <p className="text-xs text-indigo-600">
              {steps.length - completedCount} step
              {steps.length - completedCount !== 1 ? "s" : ""} remaining
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-400 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-indigo-200 bg-white divide-y divide-gray-50">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  step.done
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {step.done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.done ? "text-gray-400 line-through" : "text-gray-900"
                  }`}
                >
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-gray-500 truncate">
                    {step.description}
                  </p>
                )}
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Start →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
