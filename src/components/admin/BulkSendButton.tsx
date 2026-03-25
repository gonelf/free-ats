"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  eligibleCount: number; // new leads with contact email
  sourceFilter?: string;
  stageFilter?: string;
}

interface ProgressEvent {
  type: "start" | "progress" | "done" | "error";
  total?: number;
  sent?: number;
  skipped?: number;
  failed?: number;
  found?: number;
  notFound?: number;
  company?: string;
  error?: string;
  message?: string;
}

export function BulkSendButton({ eligibleCount, sourceFilter, stageFilter }: Props) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const router = useRouter();

  function reset() {
    setOpen(false);
    setRunning(false);
    setProgress(null);
    setLog([]);
    setDone(false);
  }

  async function handleStart() {
    setRunning(true);
    setLog([]);
    setDone(false);

    const res = await fetch("/api/admin/outreach/bulk-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        statuses: ["new"],
        source: sourceFilter ?? "all",
        stage: stageFilter ?? "all",
      }),
    });

    if (!res.ok || !res.body) {
      setLog(["Failed to start bulk send."]);
      setRunning(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event: ProgressEvent = JSON.parse(line.slice(6));
          setProgress(event);

          if (event.type === "progress") {
            const status = event.error
              ? `❌ ${event.company} — ${event.error}`
              : `✓ ${event.company}`;
            setLog((prev) => [status, ...prev].slice(0, 100));
          } else if (event.type === "done") {
            setDone(true);
            setRunning(false);
            router.refresh();
          } else if (event.type === "error") {
            setLog((prev) => [`Error: ${event.message}`, ...prev]);
            setRunning(false);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  if (eligibleCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        <Send className="h-4 w-4" />
        Send to all ({eligibleCount})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Bulk send outreach emails
              </h2>
              {!running && (
                <button onClick={reset} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="px-6 py-5 space-y-4">
              {!running && !done && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This will send the default outreach email (with a personalised{" "}
                    <strong>/claim</strong> link) to{" "}
                    <strong>{eligibleCount} new leads</strong> that have a contact email
                    {(sourceFilter && sourceFilter !== "all") || (stageFilter && stageFilter !== "all") ? (
                      <>
                        {" "}matching your active filter
                        {sourceFilter && sourceFilter !== "all" && <> (source: <strong>{sourceFilter.replace(/_/g, " ")}</strong>)</>}
                        {stageFilter && stageFilter !== "all" && <> (stage: <strong>{stageFilter}</strong>)</>}
                      </>
                    ) : null}.
                    Leads will be marked as <em>contacted</em>.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    This action cannot be undone. Make sure you&apos;re ready to send.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={reset}
                      className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStart}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      <Send className="h-4 w-4" />
                      Start sending
                    </button>
                  </div>
                </>
              )}

              {(running || done) && progress && (
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Sent", value: progress.sent ?? 0, color: "text-green-600 dark:text-green-400" },
                      { label: "Failed", value: progress.failed ?? 0, color: "text-red-600 dark:text-red-400" },
                      { label: "Total", value: progress.total ?? 0, color: "text-gray-900 dark:text-gray-100" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  {!done && progress.total && (
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round(((((progress.sent ?? 0) + (progress.failed ?? 0))) / progress.total) * 100)}%`,
                        }}
                      />
                    </div>
                  )}

                  {/* Status */}
                  {running && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending to {progress.company ?? "…"}
                    </div>
                  )}

                  {done && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Done! {progress.sent} email{progress.sent !== 1 ? "s" : ""} sent.
                    </div>
                  )}

                  {/* Log */}
                  {log.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-800 p-3 space-y-0.5">
                      {log.map((entry, i) => (
                        <p key={i} className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          {entry}
                        </p>
                      ))}
                    </div>
                  )}

                  {done && (
                    <div className="flex justify-end">
                      <button
                        onClick={reset}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
