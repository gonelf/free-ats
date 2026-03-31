import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { PipelineInsightsWidget } from "@/components/pipeline/PipelineInsightsWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";
import { getAdminUser } from "@/lib/admin";
import { DistributionStatus } from "@/components/jobs/DistributionStatus";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    select: { title: true, location: true },
  });
  if (!job) return { title: "Job — KiteHR" };
  return {
    title: `${job.title}${job.location ? ` · ${job.location}` : ""} — KiteHR`,
  };
}

async function getJob(jobId: string, orgId: string) {
  return db.job.findFirst({
    where: { id: jobId, organizationId: orgId },
    include: {
      organization: { select: { slug: true } },
      pipeline: {
        include: {
          stages: { orderBy: { order: "asc" } },
        },
      },
      applications: {
        select: {
          id: true,
          stageId: true,
          aiScore: true,
          aiScoreSummary: true,
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              tags: true,
            },
          },
        },
      },
    },
  });
}

const statusVariant = {
  OPEN: "success" as const,
  CLOSED: "secondary" as const,
  DRAFT: "warning" as const,
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    include: { organization: { select: { id: true, plan: true, aiCreditsBalance: true } } },
  });

  const job = await getJob(id, member.organization.id);
  if (!job) notFound();

  const hasAiAccess = member.organization.plan === "PRO" || member.organization.aiCreditsBalance > 0;

  const isAdmin = !!(await getAdminUser());
  const jobDistributionEnabled = await isFlagEnabled(FLAGS.JOB_DISTRIBUTION, isAdmin);

  const [distributions, linkedinIntegration] = jobDistributionEnabled
    ? await Promise.all([
        db.jobDistribution.findMany({ where: { jobId: job.id } }),
        db.integration.findUnique({
          where: {
            organizationId_platform: {
              organizationId: member.organization.id,
              platform: "linkedin",
            },
          },
          select: { id: true },
        }),
      ])
    : [[], null];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const indeedFeedUrl = `${appUrl}/${job.organization?.slug ?? ""}/jobs.xml`;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link href="/jobs" className="hover:text-gray-900 dark:hover:text-gray-100">
              Jobs
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">{job.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.title}</h1>
            <Badge variant={statusVariant[job.status]}>
              {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {job.location && (
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="text-sm text-gray-400 dark:text-gray-500">
              Created {formatDate(job.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/jobs/${id}/settings`}>
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/candidates/new?jobId=${id}`}>
              <Plus className="h-4 w-4" />
              Add Candidate
            </Link>
          </Button>
        </div>
      </div>

      {jobDistributionEnabled && (
        <DistributionStatus
          distributions={distributions}
          linkedinConnected={!!linkedinIntegration}
          indeedFeedUrl={indeedFeedUrl}
        />
      )}

      <PipelineInsightsWidget jobId={job.id} hasAiAccess={hasAiAccess} />

      <KanbanBoard
        stages={job.pipeline.stages}
        applications={job.applications}
        jobId={job.id}
        hasAiAccess={hasAiAccess}
      />
    </div>
  );
}
