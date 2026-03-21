import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Building2, Users, Briefcase, UserCheck, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [
    orgCount,
    memberCount,
    jobCount,
    candidateCount,
    expiredResumeCount,
    expiringSoonCount,
    proOrgCount,
    openJobCount,
  ] = await Promise.all([
    db.organization.count(),
    db.member.count(),
    db.job.count(),
    db.candidate.count(),
    db.candidate.count({
      where: {
        resumeExpiresAt: { lt: new Date() },
        resumeUrl: { not: null },
      },
    }),
    db.candidate.count({
      where: {
        resumeExpiresAt: {
          gt: new Date(),
          lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        resumeUrl: { not: null },
      },
    }),
    db.organization.count({ where: { plan: "PRO" } }),
    db.job.count({ where: { status: "OPEN" } }),
  ]);

  const stats = [
    {
      label: "Organizations",
      value: orgCount,
      sub: `${proOrgCount} Pro`,
      icon: Building2,
      href: "/admin/orgs",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      label: "Total Users",
      value: memberCount,
      sub: "across all orgs",
      icon: Users,
      href: "/admin/users",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
    },
    {
      label: "Jobs",
      value: jobCount,
      sub: `${openJobCount} open`,
      icon: Briefcase,
      href: "/admin/jobs",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/30",
    },
    {
      label: "Candidates",
      value: candidateCount,
      sub: "total applications",
      icon: UserCheck,
      href: "/admin/candidates",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
    {
      label: "Expired Resumes",
      value: expiredResumeCount,
      sub: "need cleanup",
      icon: FileText,
      href: "/admin/candidates?filter=expired",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
    },
    {
      label: "Expiring Soon",
      value: expiringSoonCount,
      sub: "within 7 days",
      icon: TrendingUp,
      href: "/admin/candidates?filter=expiring",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor and manage the entire platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value.toLocaleString()}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
