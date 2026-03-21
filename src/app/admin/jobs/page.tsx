import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Building2, Circle } from "lucide-react";
import { ChangeJobStatusButton } from "@/components/admin/ChangeJobStatusButton";

export default async function AdminJobsPage() {
  await requireAdmin();

  const jobs = await db.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { name: true, slug: true } },
      _count: { select: { applications: true } },
    },
  });

  const statusColors: Record<string, string> = {
    OPEN: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    DRAFT: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    CLOSED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jobs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{jobs.length} jobs across all organizations</p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Job</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Organization</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Applications</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Location</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Salary</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Created</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{job.title}</div>
                      {job.slug && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">{job.slug}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <div className="text-gray-700 dark:text-gray-300">{job.organization.name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{job.organization.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                    {job._count.applications}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{job.location || "—"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                    {job.salaryMin && job.salaryMax
                      ? `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax / 1000).toFixed(0)}k`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChangeJobStatusButton jobId={job.id} currentStatus={job.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {jobs.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">No jobs yet.</div>
        )}
      </div>
    </div>
  );
}
