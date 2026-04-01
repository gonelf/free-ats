"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Sparkles, TrendingUp, AlertTriangle, Briefcase, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CandidateResult {
  candidateId: string;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  gaps: string[];
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    tags: string[];
    linkedinUrl: string | null;
  };
}

interface SearchResponse {
  criteria: {
    roles: string[];
    skills: string[];
    locations: string[];
    experienceLevel: string;
  };
  results: CandidateResult[];
}

interface SourcingClientProps {
  hasAiAccess: boolean;
  openJobs: Array<{ id: string; title: string }>;
}

const EXAMPLE_QUERIES = [
  "Find mid-level backend developers in Europe with 3+ years SaaS experience",
  "Senior product designers with B2B SaaS background",
  "Growth marketers who have worked at early-stage startups",
];

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
  if (score >= 60) return "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
  return "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
}

export function SourcingClient({ hasAiAccess, openJobs }: SourcingClientProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [addingToJob, setAddingToJob] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError("");
    setResponse(null);
    try {
      const res = await fetch("/api/ai/sourcing-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed. Please try again.");
      } else {
        setResponse(data);
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!hasAiAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <Lock className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Sourcing is a Pro Feature</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          Search your talent pool with natural language queries. Upgrade to Pro to unlock AI-powered sourcing.
        </p>
        <Button asChild>
          <Link href="/upgrade">
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 block">
          Describe the candidate you&apos;re looking for
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Senior backend engineers in EU with SaaS experience and Python skills"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Searching…" : "Search"}
            {!loading && (
              <span className="ml-1.5 flex items-center gap-0.5 border-l border-indigo-300 pl-1.5">
                <span className="text-xs font-bold tabular-nums text-indigo-200">5</span>
                <span className="text-[10px] font-semibold text-indigo-300">cr</span>
              </span>
            )}
          </Button>
        </div>

        {/* Example queries */}
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Parsed criteria */}
      {response && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Parsed Criteria</p>
          <div className="flex flex-wrap gap-2">
            {(response.criteria?.roles ?? []).map((r) => (
              <span key={r} className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-medium">{r}</span>
            ))}
            {(response.criteria?.skills ?? []).map((s) => (
              <span key={s} className="rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-medium">{s}</span>
            ))}
            {(response.criteria?.locations ?? []).map((l) => (
              <span key={l} className="rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-0.5 text-xs font-medium">{l}</span>
            ))}
            <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-xs font-medium capitalize">
              {response.criteria.experienceLevel} level
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {response && (
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {response.results.length} match{response.results.length !== 1 ? "es" : ""} found
          </p>
          {response.results.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No candidates matched your criteria.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try broadening your search or adding more candidates to your talent pool.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {response.results.map((result) => (
                <div
                  key={result.candidateId}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <Link
                          href={`/candidates/${result.candidate.id}`}
                          className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {result.candidate.firstName} {result.candidate.lastName}
                        </Link>
                        {result.candidate.linkedinUrl && (
                          <a
                            href={result.candidate.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-indigo-500 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{result.candidate.email}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.matchReason}</p>
                    </div>
                    <div className={cn(
                      "shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold",
                      getScoreColor(result.matchScore)
                    )}>
                      <Sparkles className="h-3.5 w-3.5" />
                      {result.matchScore}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.matchedSkills.map((s) => (
                      <span key={s} className="flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 text-[11px] font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {s}
                      </span>
                    ))}
                    {result.gaps.map((g) => (
                      <span key={g} className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {g}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/candidates/${result.candidate.id}`}>
                        View Profile
                      </Link>
                    </Button>
                    {openJobs.length > 0 && (
                      <div className="relative">
                        <select
                          value={addingToJob === result.candidateId ? "" : ""}
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            setAddingToJob(result.candidateId);
                            try {
                              await fetch("/api/candidates", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  candidateId: result.candidateId,
                                  jobId: e.target.value,
                                }),
                              });
                            } finally {
                              setAddingToJob(null);
                              e.target.value = "";
                            }
                          }}
                          className="rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">
                            <Briefcase className="h-3.5 w-3.5" />
                            Add to Job…
                          </option>
                          {openJobs.map((job) => (
                            <option key={job.id} value={job.id}>{job.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
