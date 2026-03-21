import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runRedditCommenter } from "@/lib/reddit-commenter";

/**
 * Finds relevant Reddit posts and generates AI comment drafts for manual posting.
 * No Reddit API credentials required — uses Reddit's public JSON endpoints.
 * Protected by CRON_SECRET. Scheduled every 6 hours via Vercel cron.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { drafted, skipped, failed } = await runRedditCommenter();

  const status =
    drafted === 0 && failed === 0
      ? "skipped"
      : failed > 0 && drafted === 0
        ? "error"
        : "success";

  const message =
    drafted === 0 && failed === 0
      ? "Commenter disabled or no new posts found"
      : `Drafted ${drafted} comment(s), skipped ${skipped}, failed ${failed}`;

  await db.cronLog.create({
    data: {
      job: "reddit-commenter",
      status,
      message,
      details: { drafted, skipped, failed },
      durationMs: Date.now() - startedAt,
    },
  });

  return NextResponse.json({ drafted, skipped, failed });
}
