"use client";

import { useState, useTransition } from "react";
import { submitUrlsForIndexing } from "@/app/admin/indexing/actions";
import { CheckCircle2, XCircle, Loader2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

type Page = {
  url: string;
  label: string;
  group: string;
};

type SubmitResult = {
  url: string;
  status: "success" | "error";
  httpStatus: number | null;
  errorMessage: string | null;
};

interface IndexingClientProps {
  pages: Page[];
}

const GROUP_ORDER = [
  "Blog (static)",
  "Blog (generated)",
  "Salary hubs",
  "Salary city hubs",
  "Salary role hubs",
  "Salary detail pages",
];

export function IndexingClient({ pages }: IndexingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<SubmitResult[] | null>(null);

  const groups = GROUP_ORDER.filter((g) => pages.some((p) => p.group === g));
  const grouped = Object.fromEntries(
    groups.map((g) => [g, pages.filter((p) => p.group === g)])
  );

  function toggleUrl(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }

  function toggleGroup(group: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of grouped[group]) {
        checked ? next.add(p.url) : next.delete(p.url);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(pages.map((p) => p.url)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function handleSubmit() {
    const urls = Array.from(selected);
    if (urls.length === 0) return;
    setResults(null);
    startTransition(async () => {
      const res = await submitUrlsForIndexing(urls);
      setResults(res);
      router.refresh();
    });
  }

  const groupIsAllSelected = (group: string) =>
    grouped[group].every((p) => selected.has(p.url));
  const groupIsPartiallySelected = (group: string) =>
    grouped[group].some((p) => selected.has(p.url)) &&
    !groupIsAllSelected(group);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Select all ({pages.length})
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={deselectAll}
            className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
          >
            Deselect all
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={selected.size === 0 || isPending}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          {isPending
            ? `Submitting ${selected.size}…`
            : `Submit ${selected.size} URL${selected.size !== 1 ? "s" : ""}`}
        </button>
      </div>

      {/* Submit results banner */}
      {results && !isPending && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Submission complete —{" "}
            <span className="text-green-600 dark:text-green-400">
              {results.filter((r) => r.status === "success").length} succeeded
            </span>
            {results.filter((r) => r.status === "error").length > 0 && (
              <>
                {", "}
                <span className="text-red-600 dark:text-red-400">
                  {results.filter((r) => r.status === "error").length} failed
                </span>
              </>
            )}
          </p>
          {results
            .filter((r) => r.status === "error")
            .map((r) => (
              <p key={r.url} className="text-xs text-red-600 dark:text-red-400">
                {r.url}: {r.errorMessage}
              </p>
            ))}
        </div>
      )}

      {/* Groups */}
      <div className="space-y-4">
        {groups.map((group) => {
          const groupPages = grouped[group];
          const allSelected = groupIsAllSelected(group);
          const partiallySelected = groupIsPartiallySelected(group);
          return (
            <div
              key={group}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
            >
              {/* Group header */}
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = partiallySelected;
                  }}
                  onChange={(e) => toggleGroup(group, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {group}
                </span>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {groupPages.filter((p) => selected.has(p.url)).length} /{" "}
                  {groupPages.length} selected
                </span>
              </div>

              {/* Group rows */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-72 overflow-y-auto">
                {groupPages.map((page) => {
                  const isSelected = selected.has(page.url);
                  const result = results?.find((r) => r.url === page.url);
                  return (
                    <label
                      key={page.url}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUrl(page.url)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 shrink-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-gray-800 dark:text-gray-200 truncate">
                          {page.label}
                        </span>
                        <span className="block text-xs text-gray-400 dark:text-gray-500 truncate">
                          {page.url}
                        </span>
                      </span>
                      {result && (
                        <span className="shrink-0">
                          {result.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" aria-label={result.errorMessage ?? ""} />
                          )}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
