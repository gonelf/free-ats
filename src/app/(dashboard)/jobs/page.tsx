import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, MapPin, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { JobStatusDropdown } from "@/components/jobs/JobStatusDropdown";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";

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
  const hasPipelineMove = applicationCount > 0;
  const hasUsedAi = aiSummaryCount > 0 || aiScoredCount > 0;
  const openJobCount = jobs.filter((j) => j.status === "OPEN").length;

  return (
    <div>
      <OnboardingChecklist
        hasJob={hasJob}
        hasCandidate={hasCandidate}
        hasPipelineMove={hasPipelineMove}
        hasUsedAi={hasUsedAi}
      />

      <PageHeader
        title="Jobs"
        subtitle={
          jobs.length === 0
            ? "No jobs posted yet"
            : `${openJobCount} open · ${candidateCount} candidate${candidateCount !== 1 ? "s" : ""}`
        }
        action={
          <Button asChild size="sm">
            <Link href="/jobs/new">
              <Plus className="h-4 w-4" />
              New Job
            </Link>
          </Button>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
          title="Post your first job"
          description="Create a job posting to start receiving applications and building your hiring pipeline."
          action={
            <Button asChild>
              <Link href="/jobs/new">
                <Plus className="h-4 w-4" />
                Create Job
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-4 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-md transition-all"
            >
              {/* Left: title + status + metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link href={`/jobs/${job.id}`}>
                    <h2 className="font-heading font-bold text-gray-900 dark:text-gray-100 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
                      {job.title}
                    </h2>
                  </Link>
                  <Badge variant={statusVariant[job.status]} className="shrink-0">
                    {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                    {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>

              {/* Right: candidate count + actions */}
              <div className="ml-4 flex items-center gap-4 shrink-0">
                {job._count.applications > 0 && (
                  <div className="text-right hidden sm:block">
                    <div className="font-heading text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100 leading-none">
                      {job._count.applications}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {job._count.applications === 1 ? "candidate" : "candidates"}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hidden sm:flex"
                    asChild
                    title="View Public Page"
                  >
                    <a
                      href={`/${job.organization.slug}/jobs/${job.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <JobStatusDropdown jobId={job.id} initialStatus={job.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
