import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Users, Building2, Crown, Shield } from "lucide-react";
import { RemoveAdminButton } from "@/components/admin/RemoveAdminButton";
import { AddAdminForm } from "@/components/admin/AddAdminForm";

export default async function AdminUsersPage() {
  await requireAdmin();

  // Get all members with their org info (grouped by userId)
  const members = await db.member.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, plan: true },
      },
    },
  });

  // Group members by userId to show per-user info
  const userMap = new Map<string, typeof members>();
  for (const m of members) {
    if (!userMap.has(m.userId)) userMap.set(m.userId, []);
    userMap.get(m.userId)!.push(m);
  }

  const appAdmins = await db.appAdmin.findMany({ orderBy: { createdAt: "asc" } });

  const uniqueUserCount = userMap.size;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {uniqueUserCount} unique users across {members.length} memberships
          </p>
        </div>
      </div>

      {/* App Admins Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
          App Administrators
        </h2>
        <div className="rounded-xl border border-red-100 dark:border-red-900/50 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Added</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {appAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500 dark:text-red-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{admin.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RemoveAdminButton adminId={admin.id} email={admin.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3">
          <AddAdminForm />
        </div>
      </div>

      {/* All Members Section */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        Organization Members
      </h2>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">User ID</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Organization</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{member.userId.slice(0, 8)}…</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{member.organization.name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{member.organization.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.role === "OWNER"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : member.role === "ADMIN"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {member.organization.plan === "PRO" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        <Crown className="h-3 w-3" />
                        Pro
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {members.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">No members yet.</div>
        )}
      </div>
    </div>
  );
}
