import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getOrgId(userId: string) {
  const member = await db.member.findFirstOrThrow({
    where: { userId },
    select: { organizationId: true },
  });
  return member.organizationId;
}

const statusVariant = {
  OPEN: "success" as const,
  CLOSED: "secondary" as const,
  DRAFT: "warning" as const,
};

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orgId = await getOrgId(user!.id);

  const jobs = await db.job.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} total
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4" />
            New Job
          </Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Briefcase className="h-10 w-10 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No jobs yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Create your first job posting to start building your pipeline
          </p>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="h-4 w-4" />
              Create Job
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{job.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      {job._count.applications} candidates
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant={statusVariant[job.status]}>
                {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
