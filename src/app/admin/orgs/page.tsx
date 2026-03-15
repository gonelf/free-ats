import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Building2, Users, Briefcase, Sparkles, Crown } from "lucide-react";
import { DeleteOrgButton } from "@/components/admin/DeleteOrgButton";
import { ChangePlanButton } from "@/components/admin/ChangePlanButton";

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
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <p className="text-sm text-gray-500 mt-1">{orgs.length} organizations total</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left font-medium text-gray-500">Organization</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Plan</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500">Members</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500">Jobs</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500">Candidates</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500">AI Credits</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Created</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-xs text-gray-400">{org.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {org.plan === "PRO" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      <Crown className="h-3 w-3" />
                      Pro
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      Free
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center text-gray-700">{org._count.members}</td>
                <td className="px-6 py-4 text-center text-gray-700">{org._count.jobs}</td>
                <td className="px-6 py-4 text-center text-gray-700">{org._count.candidates}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-medium tabular-nums ${org.aiCreditsBalance <= 20 ? "text-red-600" : "text-gray-700"}`}>
                    {org.aiCreditsBalance.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <ChangePlanButton orgId={org.id} currentPlan={org.plan} orgName={org.name} />
                    <DeleteOrgButton orgId={org.id} orgName={org.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orgs.length === 0 && (
          <div className="py-12 text-center text-gray-500">No organizations yet.</div>
        )}
      </div>
    </div>
  );
}
