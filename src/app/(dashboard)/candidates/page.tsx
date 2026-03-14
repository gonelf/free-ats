import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidates — Free ATS",
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
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">
            {candidates.length} total candidates
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
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Users className="h-10 w-10 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No candidates yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Add candidates manually or through job applications
          </p>
          <Button asChild>
            <Link href="/candidates/new">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Tags</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Jobs</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/candidates/${c.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.email}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {c.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{c.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Briefcase className="h-3.5 w-3.5" />
                      {c._count.applications}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {formatDate(c.createdAt)}
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
