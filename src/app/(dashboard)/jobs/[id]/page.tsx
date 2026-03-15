import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

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
      pipeline: {
        include: {
          stages: { orderBy: { order: "asc" } },
        },
      },
      applications: {
        include: {
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

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/jobs" className="hover:text-gray-900">
              Jobs
            </Link>
            <span>/</span>
            <span className="text-gray-900">{job.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <Badge variant={statusVariant[job.status]}>
              {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {job.location && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="text-sm text-gray-400">
              Created {formatDate(job.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      <KanbanBoard
        stages={job.pipeline.stages}
        applications={job.applications}
        jobId={job.id}
        hasAiAccess={hasAiAccess}
      />
    </div>
  );
}
