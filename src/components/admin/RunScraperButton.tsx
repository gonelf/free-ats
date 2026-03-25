"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

type SseEvent =
  | { type: "status"; message: string }
  | { type: "thread"; id: number; title: string }
  | { type: "total"; total: number; limit: number; message: string }
  | { type: "parsing"; processed: number; total: number; newLeads: number; skipped: number; errors: number; preview: string }
  | { type: "progress"; processed: number; total: number; newLeads: number; skipped: number; errors: number }
  | { type: "lead"; company: string; hiringFor: string | null; processed: number; total: number; newLeads: number; skipped: number; errors: number }
  | { type: "done"; newLeads: number; skipped: number; errors: number; threadId: number; threadTitle: string; limitReached: boolean; limit: number }
  | { type: "error"; message: string };

type RunState =
  | { phase: "idle" }
  | { phase: "running"; message: string; thread?: { id: number; title: string }; total?: number; processed: number; newLeads: number; skipped: number; errors: number; parsing?: string; recentLeads: string[] }
  | { phase: "done"; newLeads: number; skipped: number; errors: number; threadTitle: string; limitReached: boolean; limit: number }
  | { phase: "error"; message: string };

export function RunScraperButton() {
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const router = useRouter();

  async function handleRun() {
    setState({ phase: "running", message: "Connecting…", processed: 0, newLeads: 0, skipped: 0, errors: 0, recentLeads: [] });

    try {
      const res = await fetch("/api/admin/outreach/scrape", { method: "POST" });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        setState({ phase: "error", message: data.error ?? "Request failed" });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: SseEvent;
          try {
            event = JSON.parse(line.slice(6)) as SseEvent;
          } catch {
            continue;
          }

          setState((prev: RunState) => applyEvent(prev, event));

          if (event.type === "done") {
            router.refresh();
          }
        }
      }
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  }

  function applyEvent(prev: RunState, event: SseEvent): RunState {
    if (event.type === "error") {
      return { phase: "error", message: event.message };
    }
    if (event.type === "done") {
      return { phase: "done", newLeads: event.newLeads, skipped: event.skipped, errors: event.errors, threadTitle: event.threadTitle, limitReached: event.limitReached, limit: event.limit };
    }

    // Running states — build on current running state
    const running: RunState & { phase: "running" } = prev.phase === "running"
      ? { ...prev }
      : { phase: "running", message: "", processed: 0, newLeads: 0, skipped: 0, errors: 0, recentLeads: [] };

    switch (event.type) {
      case "status":
        return { ...running, message: event.message };
      case "thread":
        return { ...running, message: `Found: ${event.title}`, thread: { id: event.id, title: event.title } };
      case "total":
        return { ...running, message: event.message, total: event.total };
      case "parsing":
        return { ...running, processed: event.processed, newLeads: event.newLeads, skipped: event.skipped, errors: event.errors, parsing: event.preview };
      case "progress":
        return { ...running, processed: event.processed, newLeads: event.newLeads, skipped: event.skipped, errors: event.errors, parsing: undefined };
      case "lead": {
        const recentLeads = [event.company, ...(running.recentLeads ?? [])].slice(0, 5);
        return { ...running, processed: event.processed, newLeads: event.newLeads, skipped: event.skipped, errors: event.errors, parsing: undefined, recentLeads };
      }
    }
    return prev;
  }

  const isRunning = state.phase === "running";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        {state.phase === "done" && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <CheckCircle className="h-3.5 w-3.5" />
            +{state.newLeads} new leads
            {state.limitReached && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">(run again for more)</span>
            )}
          </span>
        )}
        {state.phase === "error" && (
          <span className="flex items-center gap-1.5 text-xs text-red-500">
            <XCircle className="h-3.5 w-3.5" />
            {state.message}
          </span>
        )}
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
          {isRunning ? "Scraping…" : "Run HN scraper"}
        </button>
      </div>

      {/* Live progress panel */}
      {state.phase === "running" && (
        <div className="w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-xs shadow-sm space-y-2">
          {/* Status message */}
          <p className="text-gray-500 dark:text-gray-400 truncate">{state.message}</p>

          {/* Progress bar */}
          {state.total != null && state.total > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-gray-400 dark:text-gray-500">
                <span>Comments</span>
                <span>{state.processed} / {state.total}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (state.processed / state.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Counters */}
          <div className="flex gap-3 text-gray-500 dark:text-gray-400">
            <span className="text-green-600 dark:text-green-400 font-medium">+{state.newLeads} new</span>
            <span>{state.skipped} skipped</span>
            {state.errors > 0 && <span className="text-red-500">{state.errors} err</span>}
          </div>

          {/* Currently parsing */}
          {state.parsing && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-2 py-1.5">
              <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Parsing</p>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{state.parsing}</p>
            </div>
          )}

          {/* Recently found leads */}
          {state.recentLeads.length > 0 && (
            <div className="space-y-1">
              <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wide">Recently found</p>
              {state.recentLeads.map((name, i) => (
                <div key={i} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <Building2 className="h-3 w-3 text-green-500 shrink-0" />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Done summary */}
      {state.phase === "done" && (state.skipped > 0 || state.errors > 0) && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {state.skipped} already in DB · {state.errors} errors
          {state.limitReached && ` · limit ${state.limit} reached`}
        </p>
      )}
    </div>
  );
}
