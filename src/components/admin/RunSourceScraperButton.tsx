"use client";

import { useState } from "react";
import { RefreshCw, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const SOURCES = [
  { key: "reddit", label: "Reddit" },
  { key: "product_hunt", label: "Product Hunt" },
  { key: "yc", label: "YC companies" },
  { key: "wellfound", label: "Wellfound" },
  { key: "techcrunch_funding", label: "TechCrunch Funding" },
] as const;

type Source = (typeof SOURCES)[number]["key"];

type RunState =
  | { phase: "idle" }
  | { phase: "running"; source: Source }
  | { phase: "done"; source: Source; newLeads: number; skipped: number; errors: number }
  | { phase: "error"; source: Source; message: string };

export function RunSourceScraperButton() {
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleRun(source: Source) {
    setOpen(false);
    setState({ phase: "running", source });

    try {
      const res = await fetch(`/api/admin/outreach/run-scraper?source=${source}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setState({ phase: "error", source, message: data.error ?? "Request failed" });
        return;
      }

      setState({
        phase: "done",
        source,
        newLeads: data.newLeads ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? 0,
      });
      router.refresh();
    } catch (err) {
      setState({
        phase: "error",
        source,
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  const isRunning = state.phase === "running";
  const sourceLabel = (key: Source) => SOURCES.find((s) => s.key === key)?.label ?? key;

  return (
    <div className="relative flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {state.phase === "done" && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <CheckCircle className="h-3.5 w-3.5" />
            {sourceLabel(state.source)}: +{state.newLeads} leads
          </span>
        )}
        {state.phase === "error" && (
          <span className="flex items-center gap-1.5 text-xs text-red-500">
            <XCircle className="h-3.5 w-3.5" />
            {state.message}
          </span>
        )}

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? `Scraping ${sourceLabel(state.source)}…` : "Run scraper"}
            {!isRunning && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
              {SOURCES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleRun(s.key)}
                  className="w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {state.phase === "done" && (state.skipped > 0 || state.errors > 0) && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {state.skipped} already in DB · {state.errors} errors
        </p>
      )}
    </div>
  );
}
