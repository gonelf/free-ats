"use client";

import { useState } from "react";
import { Linkedin, Send, CheckCircle, XCircle, Loader2, ExternalLink, Link2, Link2Off } from "lucide-react";
import { triggerLinkedInPost, disconnectLinkedIn } from "@/app/admin/actions/linkedin";

interface Post {
  id: string;
  title: string;
  slug: string;
  planDay: number;
  createdAt: Date;
}

interface LinkedInStatus {
  connected: boolean;
  ready?: boolean;
  enabled?: boolean;
  externalId?: string | null;
  tokenExpiresAt?: Date | null;
  missingOrgId?: boolean;
}

interface LinkedInPostTriggerProps {
  posts: Post[];
  linkedInStatus: LinkedInStatus;
}

export function LinkedInPostTrigger({ posts, linkedInStatus }: LinkedInPostTriggerProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ linkedInPostUrn: string; blogUrl: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isConnected, setIsConnected] = useState(linkedInStatus.connected);
  const [disconnecting, setDisconnecting] = useState(false);

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

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await disconnectLinkedIn();
      setIsConnected(false);
      setStatus("idle");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-900/30">
            <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              LinkedIn Blog Posts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Post generated blog content to KiteHR&apos;s LinkedIn page
            </p>
          </div>
        </div>

        {isConnected ? (
          linkedInStatus.ready ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Incomplete
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            Not connected
          </span>
        )}
      </div>

      {!isConnected ? (
        <a
          href="/api/admin/integrations/linkedin/connect"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Link2 className="h-4 w-4" />
          Connect KiteHR LinkedIn
        </a>
      ) : (
        <div className="space-y-3">
          {linkedInStatus.missingOrgId && (
            <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-xs text-yellow-700 dark:text-yellow-400">
              LinkedIn organization ID not found. Disconnect and reconnect — make sure you are logged into LinkedIn as an admin of the KiteHR company page. If the issue persists, set <code className="font-mono">KITEHR_LINKEDIN_ORG_ID</code> in your environment variables.
            </div>
          )}
          {linkedInStatus.externalId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {linkedInStatus.externalId}
            </p>
          )}

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

          <div className="flex items-center gap-2">
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

            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 disabled:opacity-50 transition-colors"
            >
              <Link2Off className="h-3.5 w-3.5" />
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        </div>
      )}

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
        </div>
      )}
    </div>
  );
}
