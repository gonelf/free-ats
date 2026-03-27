"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square, RotateCcw } from "lucide-react";

const PHASES = [
  { value: "2", label: "Phase 2", description: "Role-specific hiring SOPs (25)" },
  { value: "3", label: "Phase 3", description: "Role-specific onboarding SOPs (20)" },
  { value: "4", label: "Phase 4", description: "Manager & team operations SOPs (20)" },
  { value: "5", label: "Phase 5", description: "Benefits & payroll SOPs (15)" },
  { value: "6", label: "Phase 6", description: "International & scaling SOPs (15)" },
  { value: "all", label: "All phases", description: "All remaining SOPs" },
];

const LIMITS = [
  { value: "5", label: "5 SOPs" },
  { value: "10", label: "10 SOPs" },
  { value: "25", label: "25 SOPs" },
  { value: "50", label: "50 SOPs" },
];

interface SopPopulateFormProps {
  totalInDb: number;
  publishedCount: number;
}

export function SopPopulateForm({ totalInDb, publishedCount }: SopPopulateFormProps) {
  const [phase, setPhase] = useState<string>("2");
  const [limit, setLimit] = useState<string>("5");
  const [dryRun, setDryRun] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  function buildUrl() {
    const params = new URLSearchParams();
    if (phase !== "all") params.set("phase", phase);
    params.set("limit", limit);
    if (dryRun) params.set("dryRun", "true");
    return `/api/admin/sop-populate?${params.toString()}`;
  }

  function start() {
    setLines([]);
    setDone(false);
    setRunning(true);

    const es = new EventSource(buildUrl());
    esRef.current = es;

    es.onmessage = (e) => {
      const { msg } = JSON.parse(e.data) as { msg: string };
      setLines((prev) => [...prev, msg]);
    };

    es.addEventListener("done", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setLines((prev) => [
        ...prev,
        `\nTotal upserted: ${data.totalUpserted}${data.totalInDb !== null ? ` | Total in DB: ${data.totalInDb}` : ""}`,
      ]);
      setDone(true);
      setRunning(false);
      es.close();
    });

    es.addEventListener("error", (e) => {
      if ((e as MessageEvent).data) {
        const data = JSON.parse((e as MessageEvent).data);
        setLines((prev) => [...prev, `\nError: ${data.error}`]);
      }
      setRunning(false);
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setRunning(false);
      }
    };
  }

  function stop() {
    esRef.current?.close();
    setRunning(false);
    setLines((prev) => [...prev, "\n[Stopped by user]"]);
  }

  function reset() {
    setLines([]);
    setDone(false);
  }

  const selectedPhase = PHASES.find((p) => p.value === phase);
  const scopeLabel = `${selectedPhase?.label} · ${limit} SOPs${dryRun ? " (dry run)" : ""}`;

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-900">Configuration</h2>

        {/* Phase selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Phase</label>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPhase(p.value)}
                disabled={running}
                title={p.description}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  phase === p.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {selectedPhase && (
            <p className="text-xs text-gray-400">{selectedPhase.description}</p>
          )}
        </div>

        {/* Limit selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">SOPs per run</label>
          <div className="flex gap-2">
            {LIMITS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLimit(l.value)}
                disabled={running}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  limit === l.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dry run toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            disabled={running}
            className="rounded border-gray-300"
          />
          <span className="text-xs font-medium text-gray-700">
            Dry run{" "}
            <span className="font-normal text-gray-500">(preview without DB writes)</span>
          </span>
        </label>

        {/* DB stats */}
        <div className="flex gap-6 text-xs text-gray-400">
          <span>
            In DB: <span className="font-medium text-gray-600">{totalInDb}</span> SOPs
          </span>
          <span>
            Published: <span className="font-medium text-gray-600">{publishedCount}</span> SOPs
          </span>
          <span>
            Unpublished:{" "}
            <span className="font-medium text-gray-600">{totalInDb - publishedCount}</span> SOPs
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {!running ? (
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Run: {scopeLabel}
            </button>
          ) : (
            <button
              onClick={stop}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          )}
          {lines.length > 0 && !running && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          {running && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Running…
            </span>
          )}
          {done && (
            <span className="text-xs font-medium text-green-700">Completed</span>
          )}
        </div>
      </div>

      {/* Log output */}
      {lines.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
            <span className="text-xs font-mono text-gray-400">Output</span>
            <span className="text-xs text-gray-500">{lines.length} lines</span>
          </div>
          <div
            ref={logRef}
            className="h-96 overflow-y-auto p-4 font-mono text-xs text-gray-300 space-y-0.5"
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes("✓") || line.includes("✅")
                    ? "text-green-400"
                    : line.includes("✗") || line.includes("Error") || line.includes("Fatal")
                    ? "text-red-400"
                    : line.includes("DRY RUN") || line.includes("[Stopped")
                    ? "text-yellow-400"
                    : line.startsWith("---") || line.startsWith("\n---")
                    ? "text-blue-400 font-semibold mt-1"
                    : "text-gray-300"
                }
              >
                {line || "\u00a0"}
              </div>
            ))}
            {running && (
              <div className="text-gray-500 animate-pulse">▌</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
