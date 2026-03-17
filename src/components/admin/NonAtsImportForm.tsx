"use client";

import { useState } from "react";
import { Loader2, Copy, Check, Send, ExternalLink } from "lucide-react";

interface ImportResult {
  orgId: string;
  orgSlug: string;
  jobId: string;
  jobSlug: string;
  jobUrl: string;
  companyName: string;
  jobTitle: string;
  extractedEmail: string | null;
}

type State = "idle" | "loading" | "result" | "error";

export function NonAtsImportForm() {
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [outreachEmail, setOutreachEmail] = useState("");
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachSent, setOutreachSent] = useState(false);
  const [outreachError, setOutreachError] = useState("");

  const [copied, setCopied] = useState(false);

  async function handleImport() {
    if (!url.trim() && !rawText.trim()) return;
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/non-ats-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim() || undefined,
          rawText: rawText.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "fetch_failed") {
          setErrorMsg(
            "Could not fetch that URL (it may require login). Please paste the job post text below and try again."
          );
        } else {
          setErrorMsg(data.error || "Something went wrong.");
        }
        setState("error");
        return;
      }

      setResult(data);
      setOutreachEmail(data.extractedEmail || "");
      setState("result");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  async function handleSendOutreach() {
    if (!result || !outreachEmail.trim()) return;
    setSendingOutreach(true);
    setOutreachError("");

    try {
      const res = await fetch("/api/admin/non-ats-import/send-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: outreachEmail.trim(),
          companyName: result.companyName,
          jobTitle: result.jobTitle,
          jobUrl: result.jobUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setOutreachError(data.error || "Failed to send email.");
      } else {
        setOutreachSent(true);
      }
    } catch {
      setOutreachError("Network error. Please try again.");
    } finally {
      setSendingOutreach(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.jobUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setState("idle");
    setResult(null);
    setUrl("");
    setRawText("");
    setOutreachEmail("");
    setOutreachSent(false);
    setOutreachError("");
    setErrorMsg("");
  }

  return (
    <div className="space-y-6">
      {/* Input form */}
      {(state === "idle" || state === "error") && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job post URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/posts/... or https://notion.so/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Works best for public Notion docs. LinkedIn/Twitter may require pasting text directly.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job post text (paste here)
            </label>
            <textarea
              placeholder="Paste the full job post content here — LinkedIn post, tweet, Notion export, email, etc."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          {state === "error" && errorMsg && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!url.trim() && !rawText.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Extract &amp; Import Job
          </button>
        </div>
      )}

      {/* Loading */}
      {state === "loading" && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm">Extracting job info with AI...</p>
        </div>
      )}

      {/* Result */}
      {state === "result" && result && (
        <div className="space-y-4">
          {/* Job summary card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{result.jobTitle}</h3>
                <p className="text-sm text-gray-500">{result.companyName}</p>
              </div>
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 whitespace-nowrap">
                Job Created
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
              <a
                href={result.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-indigo-600 hover:underline truncate"
              >
                {result.jobUrl}
              </a>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                title="Copy link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <a
                href={result.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                title="Open link"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Outreach panel */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Send Outreach Email</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {result.extractedEmail
                  ? "We found an email in the post — confirm it and send."
                  : "No email was found in the post. Enter it manually."}
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="hiring@company.com"
                value={outreachEmail}
                onChange={(e) => setOutreachEmail(e.target.value)}
                disabled={outreachSent}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={handleSendOutreach}
                disabled={!outreachEmail.trim() || sendingOutreach || outreachSent}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sendingOutreach ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : outreachSent ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {outreachSent ? "Sent!" : "Send"}
              </button>
            </div>

            {outreachError && (
              <p className="text-xs text-red-600">{outreachError}</p>
            )}
            {outreachSent && (
              <p className="text-xs text-green-600">
                Outreach email sent to {outreachEmail}.
              </p>
            )}
          </div>

          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Import another job
          </button>
        </div>
      )}
    </div>
  );
}
