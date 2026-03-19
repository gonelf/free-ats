import { db } from "@/lib/db";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";
import { postJobToLinkedIn, closeJobOnLinkedIn } from "./linkedin";

const MAX_RETRIES = 3;

export async function distributeJob(jobId: string): Promise<void> {
  if (!(await isFlagEnabled(FLAGS.JOB_DISTRIBUTION))) return;

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { organization: true },
  });
  if (!job || job.status !== "OPEN") return;

  const integrations = await db.integration.findMany({
    where: { organizationId: job.organizationId, enabled: true },
  });

  for (const integration of integrations) {
    // Upsert a "pending" distribution record
    const dist = await db.jobDistribution.upsert({
      where: { jobId_platform: { jobId, platform: integration.platform } },
      create: { jobId, platform: integration.platform, status: "pending" },
      update: { status: "pending", errorMessage: null },
    });

    if (integration.platform === "linkedin") {
      try {
        const externalJobId = await postJobToLinkedIn(integration, job);
        await db.jobDistribution.update({
          where: { id: dist.id },
          data: {
            status: "distributed",
            externalJobId,
            distributedAt: new Date(),
            errorMessage: null,
          },
        });
      } catch (err) {
        await db.jobDistribution.update({
          where: { id: dist.id },
          data: {
            status: "failed",
            errorMessage: err instanceof Error ? err.message : String(err),
            retryCount: { increment: 1 },
          },
        });
      }
    }

    if (integration.platform === "indeed_feed") {
      // Indeed is pull-based; marking as distributed is sufficient
      await db.jobDistribution.update({
        where: { id: dist.id },
        data: { status: "distributed", distributedAt: new Date() },
      });
    }
  }
}

export async function closeJobOnBoards(jobId: string): Promise<void> {
  if (!(await isFlagEnabled(FLAGS.JOB_DISTRIBUTION))) return;

  const distributions = await db.jobDistribution.findMany({
    where: { jobId, status: { in: ["pending", "distributed"] } },
    include: {
      job: { include: { organization: true } },
    },
  });

  for (const dist of distributions) {
    if (dist.platform === "linkedin" && dist.externalJobId) {
      const integration = await db.integration.findUnique({
        where: {
          organizationId_platform: {
            organizationId: dist.job.organizationId,
            platform: "linkedin",
          },
        },
      });

      if (integration) {
        try {
          await closeJobOnLinkedIn(integration, dist.externalJobId);
        } catch (err) {
          console.error(`Failed to close LinkedIn job ${dist.externalJobId}:`, err);
        }
      }
    }

    await db.jobDistribution.update({
      where: { id: dist.id },
      data: { status: "closed" },
    });
  }
}

export async function retryFailedDistributions(): Promise<{
  retried: number;
  succeeded: number;
  failed: number;
}> {
  if (!(await isFlagEnabled(FLAGS.JOB_DISTRIBUTION))) {
    return { retried: 0, succeeded: 0, failed: 0 };
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const failedDists = await db.jobDistribution.findMany({
    where: {
      status: "failed",
      retryCount: { lt: MAX_RETRIES },
      createdAt: { gt: cutoff },
    },
    include: {
      job: { include: { organization: true } },
    },
  });

  let succeeded = 0;
  let failed = 0;

  for (const dist of failedDists) {
    if (dist.job.status !== "OPEN") {
      await db.jobDistribution.update({
        where: { id: dist.id },
        data: { status: "closed" },
      });
      continue;
    }

    const integration = await db.integration.findUnique({
      where: {
        organizationId_platform: {
          organizationId: dist.job.organizationId,
          platform: dist.platform,
        },
      },
    });

    if (!integration?.enabled) {
      await db.jobDistribution.update({
        where: { id: dist.id },
        data: { status: "closed" },
      });
      continue;
    }

    if (dist.platform === "linkedin") {
      try {
        const externalJobId = await postJobToLinkedIn(integration, dist.job);
        await db.jobDistribution.update({
          where: { id: dist.id },
          data: {
            status: "distributed",
            externalJobId,
            distributedAt: new Date(),
            errorMessage: null,
            retryCount: { increment: 1 },
          },
        });
        succeeded++;
      } catch (err) {
        await db.jobDistribution.update({
          where: { id: dist.id },
          data: {
            errorMessage: err instanceof Error ? err.message : String(err),
            retryCount: { increment: 1 },
          },
        });
        failed++;
      }
    }
  }

  return { retried: failedDists.length, succeeded, failed };
}
