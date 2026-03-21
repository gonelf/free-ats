import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Building2, Users, Briefcase, Sparkles, Crown } from "lucide-react";
import { DeleteOrgButton } from "@/components/admin/DeleteOrgButton";
import { ChangePlanButton } from "@/components/admin/ChangePlanButton";
import { AddTrialCreditsButton } from "@/components/admin/AddTrialCreditsButton";

export default async function AdminOrgsPage() {
  await requireAdmin();

  const orgs = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          members: true,
          jobs: true,
          candidates: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Organizations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{orgs.length} organizations total</p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Organization</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Claimed</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Members</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Jobs</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Candidates</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-400">AI Credits</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Created</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{org.name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{org.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {org.plan === "PRO" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                        <Crown className="h-3 w-3" />
                        Pro
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {org.claimedStatus === "UNCLAIMED" ? (
                      <span className="inline-flex rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-400">
                        Unclaimed
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        Claimed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{org._count.members}</td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{org._count.jobs}</td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{org._count.candidates}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium tabular-nums ${org.aiCreditsBalance <= 20 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                      {org.aiCreditsBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <AddTrialCreditsButton orgId={org.id} orgName={org.name} currentCredits={org.aiCreditsBalance} />
                      <ChangePlanButton orgId={org.id} currentPlan={org.plan} orgName={org.name} />
                      <DeleteOrgButton orgId={org.id} orgName={org.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orgs.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">No organizations yet.</div>
        )}
      </div>
    </div>
  );
}
