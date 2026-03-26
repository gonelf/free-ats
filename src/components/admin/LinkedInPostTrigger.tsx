"use client";

import { useState } from "react";
import { Linkedin, Send, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { triggerLinkedInPost } from "@/app/admin/actions/linkedin";

interface Post {
  id: string;
  title: string;
  slug: string;
  planDay: number;
  createdAt: Date;
}

interface LinkedInPostTriggerProps {
  posts: Post[];
}

export function LinkedInPostTrigger({ posts }: LinkedInPostTriggerProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ linkedInPostUrn: string; blogUrl: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleTrigger() {
    if (!selectedId) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const data = await triggerLinkedInPost(selectedId);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-900/30">
          <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Manual LinkedIn Post
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Publish a generated blog post to KiteHR&apos;s LinkedIn page
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <select
          id="linkedin-post-select"
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setStatus("idle");
            setResult(null);
            setErrorMsg("");
          }}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Select a blog post —</option>
          {posts.map((post) => (
            <option key={post.id} value={post.id}>
              Day {post.planDay} · {post.title}
            </option>
          ))}
        </select>

        <button
          id="linkedin-post-trigger-btn"
          onClick={handleTrigger}
          disabled={!selectedId || status === "loading"}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {status === "loading" ? "Posting…" : "Post to LinkedIn"}
        </button>
      </div>

      {status === "success" && result && (
        <div className="mt-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-medium">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Posted successfully!
          </div>
          <div className="mt-2 space-y-1">
            {result.linkedInPostUrn && (
              <p className="text-xs text-green-600 dark:text-green-500 font-mono truncate">
                URN: {result.linkedInPostUrn}
              </p>
            )}
            <a
              href={result.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 underline underline-offset-2"
            >
              <ExternalLink className="h-3 w-3" />
              {result.blogUrl}
            </a>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
          <div className="flex items-start gap-2 text-red-700 dark:text-red-400 text-sm">
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          {errorMsg.includes("No active LinkedIn integration") && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-500">
              Connect LinkedIn from the KiteHR org&apos;s{" "}
              <a href="/settings" className="underline underline-offset-2">
                Settings page
              </a>
              , then ensure <code className="font-mono">KITEHR_ORGANIZATION_ID</code> matches
              the DB org ID or the LinkedIn org numeric ID.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
