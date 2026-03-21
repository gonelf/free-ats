import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { ClipboardList } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  "org.plan_changed": "Plan changed",
  "org.credits_updated": "Credits updated",
  "org.deleted": "Organization deleted",
  "admin.added": "Admin added",
  "admin.removed": "Admin removed",
  "candidate.deleted": "Candidate deleted",
  "job.status_changed": "Job status changed",
  "job.deleted": "Job deleted",
};

function formatMetadata(action: string, metadata: unknown): string {
  if (!metadata || typeof metadata !== "object") return "";
  const m = metadata as Record<string, unknown>;
  if (action === "org.plan_changed" || action === "job.status_changed") {
    return `${m.from} → ${m.to}`;
  }
  if (action === "org.credits_updated") {
    return `${m.from} → ${m.to} credits`;
  }
  if (action === "org.deleted") {
    return `Plan: ${m.plan}`;
  }
  return JSON.stringify(metadata);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  Organization: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  AppAdmin: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Candidate: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Job: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default async function AuditLogsPage() {
  await requireAdmin();

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Record of all administrative actions ({logs.length} most recent)
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center">
          <ClipboardList className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No audit logs yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Admin actions will be recorded here
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actor</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                      {log.actorEmail}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            ENTITY_TYPE_COLORS[log.entityType] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {log.entityType}
                        </span>
                        {log.entityName && (
                          <span className="text-gray-600 dark:text-gray-400 text-xs">{log.entityName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {formatMetadata(log.action, log.metadata)}
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
