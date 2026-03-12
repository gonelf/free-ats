import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { analyzePipelineInsights } from "@/lib/ai/job-generator";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { jobId } = await request.json();
  return withProPlanGuard(async (orgId) => {
    const job = await db.job.findFirstOrThrow({
      where: { id: jobId, organizationId: orgId },
      include: {
        pipeline: {
          include: {
            stages: {
              include: { _count: { select: { applications: true } } },
              orderBy: { order: "asc" },
            },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    const stageData = job.pipeline.stages
      .map((s) => `${s.name}: ${s._count.applications} candidates`)
      .join("\n");

    const pipelineData = `
      Job: ${job.title}
      Total Applications: ${job._count.applications}
      Stages:
      ${stageData}
    `.trim();

    return analyzePipelineInsights(pipelineData);
  });
}
