"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { AiButton } from "@/components/ai/AiGate";

interface PipelineInsights {
  bottlenecks: string[];
  conversionRates: Record<string, number>;
  recommendations: string[];
}

interface PipelineInsightsWidgetProps {
  jobId: string;
  hasAiAccess: boolean;
}

export function PipelineInsightsWidget({ jobId, hasAiAccess }: PipelineInsightsWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<PipelineInsights | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/pipeline-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to analyze pipeline");
        return;
      }
      const data = await res.json();
      setInsights(data);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pipeline Insights</h2>
          {insights && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
        <AiButton
          hasAiAccess={hasAiAccess}
          onClick={handleAnalyze}
          loading={loading}
          creditCost={10}
        >
          {insights ? "Re-analyze" : "Analyze Pipeline"}
        </AiButton>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      )}

      {insights && expanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bottlenecks */}
          {insights.bottlenecks.length > 0 && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Bottlenecks
                </p>
              </div>
              <ul className="space-y-1.5">
                {insights.bottlenecks.map((b, i) => (
                  <li key={i} className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversion Rates */}
          {Object.keys(insights.conversionRates).length > 0 && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conversion Rates
                </p>
              </div>
              <ul className="space-y-1.5">
                {Object.entries(insights.conversionRates).map(([stage, rate]) => (
                  <li key={stage} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{stage}</span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums ml-2">
                      {typeof rate === "number" ? `${rate}%` : rate}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Recommendations
                </p>
              </div>
              <ul className="space-y-1.5">
                {insights.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
