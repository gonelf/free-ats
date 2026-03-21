import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Building2, FileText, AlertTriangle, Clock } from "lucide-react";
import { UpdateResumeExpiryButton } from "@/components/admin/UpdateResumeExpiryButton";
import { DeleteCandidateButton } from "@/components/admin/DeleteCandidateButton";

interface SearchParams {
  filter?: string;
  page?: string;
}

export default async function AdminCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const filter = params.filter;
  const page = parseInt(params.page ?? "1");
  const pageSize = 50;

  const now = new Date();
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const where =
    filter === "expired"
      ? { resumeExpiresAt: { lt: now }, resumeUrl: { not: null as string | null } }
      : filter === "expiring"
      ? { resumeExpiresAt: { gt: now, lt: sevenDaysFromNow }, resumeUrl: { not: null as string | null } }
      : filter === "has-resume"
      ? { resumeUrl: { not: null as string | null } }
      : {};

  const [candidates, total] = await Promise.all([
    db.candidate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        organization: { select: { name: true, slug: true } },
        _count: { select: { applications: true } },
      },
    }),
    db.candidate.count({ where }),
  ]);

  const filterLabels: Record<string, string> = {
    expired: "Expired Resumes",
    expiring: "Expiring Soon (7 days)",
    "has-resume": "Has Resume",
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Candidates & Resumes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} candidates
            {filter ? ` (${filterLabels[filter] ?? filter})` : " total"}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: undefined, label: "All" },
          { value: "has-resume", label: "Has Resume" },
          { value: "expiring", label: "Expiring Soon" },
          { value: "expired", label: "Expired" },
        ].map((f) => (
          <a
            key={f.label}
            href={f.value ? `/admin/candidates?filter=${f.value}` : "/admin/candidates"}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Candidate</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Organization</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Applications</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Resume</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Resume Expiry</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Created</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {candidates.map((candidate) => {
                const isExpired =
                  candidate.resumeExpiresAt && candidate.resumeExpiresAt < now;
                const isExpiringSoon =
                  candidate.resumeExpiresAt &&
                  candidate.resumeExpiresAt > now &&
                  candidate.resumeExpiresAt < sevenDaysFromNow;

                return (
                  <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {candidate.firstName} {candidate.lastName}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{candidate.email}</div>
                        {candidate.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {candidate.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:text-indigo-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                        <div>
                          <div className="text-gray-700 dark:text-gray-300">{candidate.organization.name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{candidate.organization.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                      {candidate._count.applications}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.resumeUrl ? (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">View</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.resumeExpiresAt ? (
                        <div className="flex items-center gap-1.5">
                          {isExpired ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          ) : isExpiringSoon ? (
                            <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          ) : null}
                          <span
                            className={`text-xs font-medium ${
                              isExpired
                                ? "text-red-600 dark:text-red-400"
                                : isExpiringSoon
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {new Date(candidate.resumeExpiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">No expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <UpdateResumeExpiryButton
                          candidateId={candidate.id}
                          currentExpiry={candidate.resumeExpiresAt?.toISOString() ?? null}
                        />
                        <DeleteCandidateButton
                          candidateId={candidate.id}
                          name={`${candidate.firstName} ${candidate.lastName}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {candidates.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">No candidates found.</div>
        )}
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/candidates?${filter ? `filter=${filter}&` : ""}page=${page - 1}`}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </a>
            )}
            {page * pageSize < total && (
              <a
                href={`/admin/candidates?${filter ? `filter=${filter}&` : ""}page=${page + 1}`}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
