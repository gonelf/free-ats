import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createPipeline } from "@/app/actions";
import { PipelineKanbanClient } from "@/components/pipeline/PipelineKanbanClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipelines — KiteHR",
  description: "Track and manage candidates across your hiring pipelines.",
};

export default async function PipelinesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    include: { organization: { select: { id: true, plan: true, aiCreditsBalance: true } } },
  });

  const orgId = member.organization.id;
  const hasAiAccess = member.organization.plan === "PRO" || member.organization.aiCreditsBalance > 0;

  const pipelinesData = await db.pipeline.findMany({
    where: { organizationId: orgId },
    include: {
      stages: { orderBy: { order: "asc" } },
      jobs: {
        where: { NOT: { status: "CLOSED" } }, // Don't show candidates for closed jobs in aggregate view
        include: {
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
      },
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Transform data to flatten applications per pipeline
  const pipelines = pipelinesData.map((p) => ({
    ...p,
    applications: p.jobs.flatMap((j) => 
      j.applications.map((app) => ({
        ...app,
        job: { id: j.id, title: j.title }
      }))
    ),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipelines</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage candidates across all active jobs.
          </p>
        </div>
        <form action={async (formData) => {
          "use server";
          await createPipeline(formData);
        }}>
          <Button type="submit" size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Pipeline
          </Button>
        </form>
      </div>

      <PipelineKanbanClient 
        pipelines={pipelines} 
        hasAiAccess={hasAiAccess} 
      />
    </div>
  );
}
