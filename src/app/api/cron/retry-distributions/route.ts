import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retryFailedDistributions } from "@/lib/distribution";

/**
 * Retries failed job distribution attempts (up to 3 times per record, within 24h).
 * Protected by CRON_SECRET. Scheduled hourly via Vercel cron.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { retried, succeeded, failed } = await retryFailedDistributions();

  const status = retried === 0 ? "skipped" : failed > 0 && succeeded === 0 ? "error" : "success";
  const message =
    retried === 0
      ? "No failed distributions to retry"
      : `Retried ${retried}: ${succeeded} succeeded, ${failed} still failing`;

  await db.cronLog.create({
    data: {
      job: "retry-distributions",
      status,
      message,
      details: { retried, succeeded, failed },
      durationMs: Date.now() - startedAt,
    },
  });

  return NextResponse.json({ retried, succeeded, failed });
}
