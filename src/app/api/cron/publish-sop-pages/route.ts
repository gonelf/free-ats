/**
 * Cron: Publish SOP Pages
 *
 * Flips publishedAt for the next batch of GeneratedSop rows, making those
 * pages live. Runs every other day via Vercel Cron (see vercel.json).
 *
 * Rollout order: phase 2 → phase 3 → phase 4 → phase 5 → phase 6
 * Each run publishes up to SOPS_PER_RUN entries in phase/createdAt order.
 *
 * After publishing, all new URLs are submitted to IndexNow for near-instant
 * indexing by Bing, Yandex, and partner engines.
 *
 * Secured by CRON_SECRET (same pattern as other crons).
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const SITE_HOST = "kitehr.co";
const SITE_BASE = `https://${SITE_HOST}`;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "6f14bfa2e3d84c9ba7e5f1092c3d4a68";
const SOPS_PER_RUN = 5;

async function submitIndexNow(
  urls: string[]
): Promise<{ submitted: number; status: number | null; error?: string }> {
  if (urls.length === 0) return { submitted: 0, status: null };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_BASE}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    return { submitted: urls.length, status: res.status };
  } catch (err) {
    return { submitted: 0, status: null, error: String(err) };
  }
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  async function saveLog(
    status: "success" | "skipped" | "error",
    message: string,
    details?: object
  ) {
    await db.cronLog.create({
      data: {
        job: "publish-sop-pages",
        status,
        message,
        details: details ?? {},
        durationMs: Date.now() - startedAt,
      },
    });
  }

  // Find unpublished SOPs, ordered by phase then createdAt
  const unpublished = await db.generatedSop.findMany({
    where: { publishedAt: null },
    orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
    take: SOPS_PER_RUN,
    select: { id: true, slug: true, title: true, phase: true },
  });

  if (unpublished.length === 0) {
    await saveLog("skipped", "All generated SOPs are already published");
    return NextResponse.json({ message: "All SOPs are already published" });
  }

  const ids = unpublished.map((s) => s.id);
  const slugs = unpublished.map((s) => s.slug);

  // Publish: set publishedAt = now()
  const result = await db.generatedSop.updateMany({
    where: { id: { in: ids } },
    data: { publishedAt: new Date() },
  });

  // Revalidate the index page so it shows the new SOPs immediately
  revalidatePath("/hr-sop", "page");

  // Ping Google to re-crawl sitemap
  const sitemapUrl = `${SITE_BASE}/sitemap.xml`;
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
  } catch {
    // Non-fatal
  }

  // Submit new URLs to IndexNow
  const indexNowUrls = slugs.map((slug) => `${SITE_BASE}/hr-sop/${slug}`);
  const indexNowResult = await submitIndexNow(indexNowUrls);

  const totalPublished = await db.generatedSop.count({ where: { publishedAt: { not: null } } });
  const totalRemaining = await db.generatedSop.count({ where: { publishedAt: null } });

  await saveLog(
    "success",
    `Published ${result.count} SOPs (phases ${[...new Set(unpublished.map((s) => s.phase))].join(", ")})`,
    {
      sops: unpublished.map((s) => ({ slug: s.slug, title: s.title, phase: s.phase })),
      published: result.count,
      totalPublished,
      totalRemaining,
      indexNow: indexNowResult,
    }
  );

  return NextResponse.json({
    published: result.count,
    sops: unpublished.map((s) => s.slug),
    totalPublished,
    totalRemaining,
  });
}
