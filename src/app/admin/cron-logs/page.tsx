import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Clock, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

const JOB_LABELS: Record<string, string> = {
  "publish-salary-pages": "Publish Salary Pages",
  "cleanup-resumes": "Cleanup Resumes",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        success
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
        <XCircle className="h-3 w-3" />
        error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
      <MinusCircle className="h-3 w-3" />
      skipped
    </span>
  );
}

export default async function CronLogsPage() {
  await requireAdmin();

  const logs = await db.cronLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cron Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 100 cron job runs</p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
          <Clock className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No cron runs recorded yet.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Logs will appear here after the first cron execution.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Job</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Message</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Run at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {JOB_LABELS[log.job] ?? log.job}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-sm">
                      <span className="block truncate">{log.message ?? "—"}</span>
                      {log.details && Object.keys(log.details as object).length > 0 && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                            details
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-800 rounded p-2 overflow-x-auto text-gray-700 dark:text-gray-300">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums">
                      {log.durationMs != null ? `${log.durationMs}ms` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
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
  );
}
