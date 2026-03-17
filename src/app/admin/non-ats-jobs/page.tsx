import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NonAtsImportForm } from "@/components/admin/NonAtsImportForm";
import { ExternalLink } from "lucide-react";

export default async function NonAtsJobsPage() {
  await requireAdmin();

  const unclaimedOrgs = await db.organization.findMany({
    where: { claimedStatus: "UNCLAIMED" },
    orderBy: { createdAt: "desc" },
    include: {
      jobs: {
        select: { id: true, title: true, slug: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kitehr.co";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Non-ATS Job Import</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste a job post from LinkedIn, Twitter, Notion, or anywhere else. KiteHR will extract
          the details, create the company and job, and give you a shareable link to send as
          outreach.
        </p>
      </div>

      <NonAtsImportForm />

      {/* Previously imported (unclaimed) orgs */}
      {unclaimedOrgs.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Previously Imported ({unclaimedOrgs.length})
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Company</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Job Title</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Job URL</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Imported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unclaimedOrgs.map((org) => {
                  const job = org.jobs[0];
                  const jobUrl = job ? `${appUrl}/${org.slug}/jobs/${job.slug}` : null;
                  return (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-400">{org.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {job?.title || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {jobUrl ? (
                          <a
                            href={jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:underline text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View job
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                          Unclaimed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
