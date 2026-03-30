import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidates — KiteHR",
  description: "Browse and manage your candidate talent pool.",
};

export default async function CandidatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    select: { organizationId: true },
  });

  const candidates = await db.candidate.findMany({
    where: { organizationId: member.organizationId },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">Candidates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {candidates.length === 0
              ? "Your talent pool lives here"
              : `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""} in your talent pool`}
          </p>
        </div>
        <Button asChild>
          <Link href="/candidates/new">
            <Plus className="h-4 w-4" />
            Add Candidate
          </Link>
        </Button>
      </div>

      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 py-20 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-5">
            <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
            Build your talent pool
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6 leading-relaxed">
            Add candidates manually, upload resumes, or they&apos;ll appear automatically when they apply to your jobs.
          </p>
          <Button asChild>
            <Link href="/candidates/new">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Tags</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-400">Jobs</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/candidates/${c.id}`}
                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-teal-700 dark:hover:text-teal-400"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{c.email}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            +{c.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Briefcase className="h-3.5 w-3.5" />
                        {c._count.applications}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 dark:text-gray-500 hidden sm:table-cell">
                      {formatDate(c.createdAt)}
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
