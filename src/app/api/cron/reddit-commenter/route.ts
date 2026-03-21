import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runRedditCommenter } from "@/lib/reddit-commenter";

/**
 * Posts AI-generated comments to relevant Reddit threads to market KiteHR.
 * Protected by CRON_SECRET. Scheduled every 6 hours via Vercel cron.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { posted, skipped, failed } = await runRedditCommenter();

  const status =
    posted === 0 && failed === 0
      ? "skipped"
      : failed > 0 && posted === 0
        ? "error"
        : "success";

  const message =
    posted === 0 && failed === 0
      ? "Commenter disabled or no new posts found"
      : `Posted ${posted} comment(s), skipped ${skipped}, failed ${failed}`;

  await db.cronLog.create({
    data: {
      job: "reddit-commenter",
      status,
      message,
      details: { posted, skipped, failed },
      durationMs: Date.now() - startedAt,
    },
  });

  return NextResponse.json({ posted, skipped, failed });
}
