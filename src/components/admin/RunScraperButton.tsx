"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Result = {
  newLeads?: number;
  skipped?: number;
  errors?: number;
  error?: string;
  skipped_reason?: string;
};

export function RunScraperButton() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();

  async function handleRun() {
    setStatus("running");
    setResult(null);
    try {
      const res = await fetch("/api/admin/outreach/scrape", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setResult({ error: data.error ?? "Unknown error" });
      } else {
        setStatus("done");
        setResult(data);
        router.refresh();
      }
    } catch (err) {
      setStatus("error");
      setResult({ error: err instanceof Error ? err.message : "Network error" });
    }
  }

  return (
    <div className="flex items-center gap-3">
      {status === "done" && result && (
        <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="h-3.5 w-3.5" />
          +{result.newLeads ?? 0} new leads
        </span>
      )}
      {status === "error" && result?.error && (
        <span className="flex items-center gap-1.5 text-xs text-red-500">
          <XCircle className="h-3.5 w-3.5" />
          {result.error}
        </span>
      )}
      <button
        onClick={handleRun}
        disabled={status === "running"}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        <RefreshCw className={`h-4 w-4 ${status === "running" ? "animate-spin" : ""}`} />
        {status === "running" ? "Scraping…" : "Run HN scraper"}
      </button>
    </div>
  );
}
