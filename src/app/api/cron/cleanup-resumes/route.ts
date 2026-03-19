import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteResumeFromR2 } from "@/lib/r2";

/**
 * Deletes R2 objects and clears resumeUrl for free-plan resumes that have
 * passed their 10-day expiry. Intended to be called daily via a cron job
 * (e.g. Vercel Cron or an external scheduler).
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await db.candidate.findMany({
    where: {
      resumeUrl: { not: null },
      resumeExpiresAt: { lt: new Date() },
    },
    select: { id: true, resumeUrl: true },
  });

  let deleted = 0;
  let failed = 0;

  for (const candidate of expired) {
    try {
      await deleteResumeFromR2(candidate.resumeUrl!);
      await db.candidate.update({
        where: { id: candidate.id },
        data: { resumeUrl: null, resumeExpiresAt: null },
      });
      deleted++;
    } catch (err) {
      console.error(`Failed to delete resume for candidate ${candidate.id}:`, err);
      failed++;
    }
  }

  const status = failed > 0 && deleted === 0 ? "error" : "success";
  const message =
    expired.length === 0
      ? "No expired resumes found"
      : `Deleted ${deleted} resume(s), ${failed} failed`;

  await db.cronLog.create({
    data: {
      job: "cleanup-resumes",
      status: expired.length === 0 ? "skipped" : status,
      message,
      details: { total: expired.length, deleted, failed },
      durationMs: Date.now() - startedAt,
    },
  });

  return NextResponse.json({ deleted, failed });
}
