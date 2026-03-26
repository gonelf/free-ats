import { requireAdmin } from "@/lib/admin";
import { getIndexingPages, getIndexingLogs } from "./actions";
import { IndexingClient } from "@/components/admin/IndexingClient";
import { Globe, CheckCircle2, XCircle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
      <XCircle className="h-3 w-3" />
      error
    </span>
  );
}

export default async function IndexingPage() {
  await requireAdmin();

  const [pages, logs] = await Promise.all([getIndexingPages(), getIndexingLogs()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Google Indexing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Submit blog and salary pages to the Google Indexing API. Google
          prioritizes crawling submitted URLs within hours.
        </p>
      </div>

      {/* Page selector */}
      <div className="mb-10">
        <IndexingClient pages={pages} />
      </div>

      {/* Logs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Submission Logs
        </h2>
        {logs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
            <Globe className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No submissions yet. Select pages above and click Submit.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      URL
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      HTTP
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Submitted by
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <span
                          className="block truncate text-gray-800 dark:text-gray-200 font-mono text-xs"
                          title={log.url}
                        >
                          {log.url}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums">
                        {log.httpStatus ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                        {log.errorMessage ? (
                          <span className="text-red-600 dark:text-red-400 text-xs">
                            {log.errorMessage}
                          </span>
                        ) : log.response ? (
                          <details>
                            <summary className="cursor-pointer text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                              response
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-800 rounded p-2 overflow-x-auto text-gray-700 dark:text-gray-300">
                              {JSON.stringify(log.response, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {log.submittedBy}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap text-xs">
                        {log.createdAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZoneName: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
