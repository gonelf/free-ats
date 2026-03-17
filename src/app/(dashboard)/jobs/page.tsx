import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, MapPin, Users, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { JobStatusDropdown } from "@/components/jobs/JobStatusDropdown";

export const metadata: Metadata = {
  title: "Jobs — KiteHR",
  description: "Manage your open job postings and track candidate applications.",
};

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

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    select: { organizationId: true },
  });

  const orgId = member.organizationId;

  const [jobs, candidateCount, applicationCount, aiSummaryCount, aiScoredCount] = await Promise.all([
    db.job.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { applications: true } },
        organization: { select: { slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.candidate.count({ where: { organizationId: orgId } }),
    db.application.count({ where: { job: { organizationId: orgId } } }),
    db.aiSummary.count({ where: { candidate: { organizationId: orgId } } }),
    db.application.count({
      where: { job: { organizationId: orgId }, aiScore: { not: null } },
    }),
  ]);

  const hasJob = jobs.length > 0;
  const hasCandidate = candidateCount > 0;
  // "hasPipelineMove" means at least one application has been updated (moved) after creation
  const hasPipelineMove = applicationCount > 0;
  const hasUsedAi = aiSummaryCount > 0 || aiScoredCount > 0;

  return (
    <div>
      <OnboardingChecklist
        hasJob={hasJob}
        hasCandidate={hasCandidate}
        hasPipelineMove={hasPipelineMove}
        hasUsedAi={hasUsedAi}
      />

      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} total
          </p>
        </div>
        <Button asChild size="sm">
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
            <div
              key={job.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                  <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/jobs/${job.id}`} className="hover:underline">
                    <h2 className="font-semibold text-gray-900 block truncate">{job.title}</h2>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
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
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-3 flex items-center justify-end gap-1 md:gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hidden sm:flex" asChild title="View Public Page">
                  <a href={`/${job.organization.slug}/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <JobStatusDropdown jobId={job.id} initialStatus={job.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
