"use client";

import { useEffect, useState, useTransition } from "react";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Play,
  Save,
} from "lucide-react";

interface RedditComment {
  id: string;
  postId: string;
  postTitle: string;
  subreddit: string;
  postUrl: string;
  commentId: string | null;
  commentText: string;
  status: string;
  errorMsg: string | null;
  createdAt: string;
}

interface RedditConfig {
  id: string;
  enabled: boolean;
  subreddits: string[];
  keywords: string[];
}

interface Stats {
  totalPosted: number;
  todayPosted: number;
  successRate: number;
  totalAttempted: number;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "posted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        posted
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        <XCircle className="h-3 w-3" />
        failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      <MinusCircle className="h-3 w-3" />
      skipped
    </span>
  );
}

export default function RedditCommenterPage() {
  const [config, setConfig] = useState<RedditConfig | null>(null);
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [subredditsInput, setSubredditsInput] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [isPending, startTransition] = useTransition();

  async function fetchData() {
    const res = await fetch("/api/admin/reddit-commenter");
    if (!res.ok) return;
    const data = await res.json();
    setConfig(data.config);
    setComments(data.recentComments);
    setStats(data.stats);
    setSubredditsInput(data.config.subreddits.join(", "));
    setKeywordsInput(data.config.keywords.join(", "));
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleToggle() {
    if (!config) return;
    const newEnabled = !config.enabled;
    setConfig({ ...config, enabled: newEnabled });
    fetch("/api/admin/reddit-commenter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newEnabled }),
    });
  }

  function handleSaveConfig() {
    const subreddits = subredditsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const keywords = keywordsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    fetch("/api/admin/reddit-commenter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subreddits, keywords }),
    }).then(() => fetchData());
  }

  function handleRunNow() {
    setRunResult(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/reddit-commenter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run" }),
      });
      const data = await res.json();
      if (res.ok) {
        setRunResult(
          `Run complete: ${data.posted} posted, ${data.skipped} skipped, ${data.failed} failed`
        );
        fetchData();
      } else {
        setRunResult(`Error: ${data.error ?? "Unknown error"}`);
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reddit Auto-Commenter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitors Reddit for hiring discussions and posts AI-generated comments mentioning KiteHR.
          </p>
        </div>
        <button
          onClick={handleRunNow}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {isPending ? "Running…" : "Run Now"}
        </button>
      </div>

      {runResult && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {runResult}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mb-8 grid grid-cols-4 gap-4">
          {[
            { label: "Total Posted", value: stats.totalPosted },
            { label: "Today", value: stats.todayPosted },
            { label: "Success Rate", value: `${stats.successRate}%` },
            { label: "Total Attempts", value: stats.totalAttempted },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Config */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Configuration</h2>

        {/* Enable toggle */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Enable auto-commenter</p>
            <p className="text-xs text-gray-500 mt-0.5">
              When enabled, the cron job will post comments every 6 hours.
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config?.enabled ? "bg-red-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                config?.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Subreddits */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Subreddits (comma-separated, without r/)
          </label>
          <input
            type="text"
            value={subredditsInput}
            onChange={(e) => setSubredditsInput(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="recruiting, humanresources, startups"
          />
        </div>

        {/* Keywords */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Keywords to search (comma-separated)
          </label>
          <input
            type="text"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="ATS, applicant tracking, hiring software"
          />
        </div>

        <button
          onClick={handleSaveConfig}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Save className="h-4 w-4" />
          Save configuration
        </button>
      </div>

      {/* Recent comments */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent Comments</h2>

        {comments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No comments yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Enable the commenter and click Run Now to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Post</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Subreddit</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Comment</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comments.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs">
                      <a
                        href={c.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-medium text-gray-900 hover:text-red-600"
                        title={c.postTitle}
                      >
                        {c.postTitle}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500">r/{c.subreddit}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                      {c.errorMsg && (
                        <p className="mt-0.5 text-xs text-red-500 max-w-[180px] truncate" title={c.errorMsg}>
                          {c.errorMsg}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      {c.commentText ? (
                        <details>
                          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                            view comment
                          </summary>
                          <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                            {c.commentText}
                          </p>
                        </details>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap text-xs">
                      {new Date(c.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
