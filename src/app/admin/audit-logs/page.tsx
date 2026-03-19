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
  Organization: "bg-blue-50 text-blue-700",
  AppAdmin: "bg-red-50 text-red-700",
  Candidate: "bg-purple-50 text-purple-700",
  Job: "bg-green-50 text-green-700",
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
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record of all administrative actions ({logs.length} most recent)
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <ClipboardList className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No audit logs yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Admin actions will be recorded here
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Entity</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {log.actorEmail}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          ENTITY_TYPE_COLORS[log.entityType] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.entityType}
                      </span>
                      {log.entityName && (
                        <span className="text-gray-600 text-xs">{log.entityName}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatMetadata(log.action, log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
