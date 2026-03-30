"use client";

import { useState } from "react";
import { RefreshCw, ChevronDown, CheckCircle, XCircle, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

const SOURCES = [
  { key: "hn_hiring", label: "HN Hiring" },
  { key: "linkedin", label: "LinkedIn Posts" },
  { key: "reddit", label: "Reddit" },
  { key: "product_hunt", label: "Product Hunt" },
  { key: "yc", label: "YC companies" },
  { key: "techcrunch_funding", label: "TechCrunch Funding" },
] as const;

type Source = (typeof SOURCES)[number]["key"];

type HnRunning = {
  phase: "running";
  source: "hn_hiring";
  message: string;
  thread?: { id: number; title: string };
  total?: number;
  processed: number;
  newLeads: number;
  skipped: number;
  errors: number;
  parsing?: string;
  recentLeads: string[];
};

type HnDone = {
  phase: "done";
  source: "hn_hiring";
  newLeads: number;
  skipped: number;
  errors: number;
  threadTitle: string;
  limitReached: boolean;
  limit: number;
};

type SimpleRunning = { phase: "running"; source: Exclude<Source, "hn_hiring"> };
type SimpleDone = { phase: "done"; source: Exclude<Source, "hn_hiring">; newLeads: number; skipped: number; errors: number };

type RunState =
  | { phase: "idle" }
  | HnRunning
  | SimpleRunning
  | HnDone
  | SimpleDone
  | { phase: "error"; source: Source; message: string };

export function RunSourceScraperButton() {
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleRun(source: Source) {
    setOpen(false);

    if (source === "hn_hiring") {
      await runHn();
    } else {
      await runSimple(source);
    }
  }

  async function runHn() {
    setState({
      phase: "running",
      source: "hn_hiring",
      message: "Connecting…",
      processed: 0,
      newLeads: 0,
      skipped: 0,
      errors: 0,
      recentLeads: [],
    });

    try {
      const res = await fetch("/api/admin/outreach/scrape", { method: "POST" });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        setState({ phase: "error", source: "hn_hiring", message: data.error ?? "Request failed" });
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
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          setState((prev) => applyHnEvent(prev, event));

          if (event.type === "done") {
            router.refresh();
          }
        }
      }
    } catch (err) {
      setState({ phase: "error", source: "hn_hiring", message: err instanceof Error ? err.message : "Network error" });
    }
  }

  function applyHnEvent(prev: RunState, event: Record<string, unknown>): RunState {
    if (event.type === "error") {
      return { phase: "error", source: "hn_hiring", message: event.message as string };
    }
    if (event.type === "done") {
      return {
        phase: "done",
        source: "hn_hiring",
        newLeads: event.newLeads as number,
        skipped: event.skipped as number,
        errors: event.errors as number,
        threadTitle: event.threadTitle as string,
        limitReached: event.limitReached as boolean,
        limit: event.limit as number,
      };
    }

    const running: HnRunning =
      prev.phase === "running" && prev.source === "hn_hiring"
        ? { ...prev }
        : { phase: "running", source: "hn_hiring", message: "", processed: 0, newLeads: 0, skipped: 0, errors: 0, recentLeads: [] };

    switch (event.type) {
      case "status":
        return { ...running, message: event.message as string };
      case "thread":
        return { ...running, message: `Found: ${event.title}`, thread: { id: event.id as number, title: event.title as string } };
      case "total":
        return { ...running, message: event.message as string, total: event.total as number };
      case "parsing":
        return { ...running, processed: event.processed as number, newLeads: event.newLeads as number, skipped: event.skipped as number, errors: event.errors as number, parsing: event.preview as string };
      case "progress":
        return { ...running, processed: event.processed as number, newLeads: event.newLeads as number, skipped: event.skipped as number, errors: event.errors as number, parsing: undefined };
      case "lead": {
        const recentLeads = [event.company as string, ...running.recentLeads].slice(0, 5);
        return { ...running, processed: event.processed as number, newLeads: event.newLeads as number, skipped: event.skipped as number, errors: event.errors as number, parsing: undefined, recentLeads };
      }
    }
    return prev;
  }

  async function runSimple(source: Exclude<Source, "hn_hiring">) {
    setState({ phase: "running", source });

    try {
      const res = await fetch(`/api/admin/outreach/run-scraper?source=${source}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setState({ phase: "error", source, message: data.error ?? "Request failed" });
        return;
      }

      setState({ phase: "done", source, newLeads: data.newLeads ?? 0, skipped: data.skipped ?? 0, errors: data.errors ?? 0 });
      router.refresh();
    } catch (err) {
      setState({ phase: "error", source, message: err instanceof Error ? err.message : "Network error" });
    }
  }

  const isRunning = state.phase === "running";
  const sourceLabel = (key: Source) => SOURCES.find((s) => s.key === key)?.label ?? key;

  const runningLabel =
    state.phase === "running"
      ? state.source === "hn_hiring"
        ? "Scraping HN…"
        : `Scraping ${sourceLabel(state.source)}…`
      : "Run scraper";

  return (
    <div className="relative flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {state.phase === "done" && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <CheckCircle className="h-3.5 w-3.5" />
            {sourceLabel(state.source)}: +{state.newLeads} leads
            {state.source === "hn_hiring" && (state as HnDone).limitReached && (
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

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? runningLabel : "Run scraper"}
            {!isRunning && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
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
          {state.source === "hn_hiring" && (state as HnDone).limitReached && ` · limit ${(state as HnDone).limit} reached`}
        </p>
      )}

      {/* HN live progress panel */}
      {state.phase === "running" && state.source === "hn_hiring" && (
        <div className="w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-xs shadow-sm space-y-2">
          <p className="text-gray-500 dark:text-gray-400 truncate">{state.message}</p>

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

          <div className="flex gap-3 text-gray-500 dark:text-gray-400">
            <span className="text-green-600 dark:text-green-400 font-medium">+{state.newLeads} new</span>
            <span>{state.skipped} skipped</span>
            {state.errors > 0 && <span className="text-red-500">{state.errors} err</span>}
          </div>

          {state.parsing && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-2 py-1.5">
              <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Parsing</p>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{state.parsing}</p>
            </div>
          )}

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
    </div>
  );
}
