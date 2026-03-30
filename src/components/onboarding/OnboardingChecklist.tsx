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
  hasUsedAi: boolean;
}

export function OnboardingChecklist({
  hasJob,
  hasCandidate,
  hasPipelineMove,
  hasUsedAi,
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
      done: hasUsedAi,
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (dismissed || allDone) return null;

  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 overflow-hidden mb-6">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">
              Getting started
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-400">
              {completedCount} of {steps.length} complete
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-1.5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 transition-colors"
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
              className="p-1.5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-400 dark:text-teal-500 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-teal-100 dark:bg-teal-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  step.done
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500"
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
                    step.done ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {step.description}
                  </p>
                )}
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className="shrink-0 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
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
