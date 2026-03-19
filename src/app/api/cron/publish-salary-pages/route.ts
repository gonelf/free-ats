/**
 * Cron: Publish Salary Pages
 *
 * Flips publishedAt for the next batch of SalaryEntry rows, making those
 * pages live. Runs every other day via Vercel Cron (see vercel.json).
 *
 * Rollout order:
 *   Tier 1 (10 cities)  → published in first run
 *   Tier 2 (20 cities)  → published across runs 2–3
 *   Tier 3 (20 cities)  → published across runs 4–5
 *
 * Each run publishes 10 cities worth of entries (all roles for each city).
 * The cron fires every other day so the full ~50 cities roll out over ~10 days.
 *
 * Secured by CRON_SECRET (same pattern as /api/cron/cleanup-resumes).
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCitiesByTier } from "@/app/salaries/salary-data";

// How many cities to publish per cron run (all roles for each city)
const CITIES_PER_RUN = 10;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count already-published entries to determine which tier to work on next
  const publishedCitySlugs = await db.salaryEntry.findMany({
    where: { publishedAt: { not: null } },
    select: { citySlug: true },
    distinct: ["citySlug"],
  });
  const publishedSet = new Set(publishedCitySlugs.map((r) => r.citySlug));

  // Find the next unpublished cities, in tier order
  const tier1Cities = getCitiesByTier(1);
  const tier2Cities = getCitiesByTier(2);
  const tier3Cities = getCitiesByTier(3);
  const allCitiesOrdered = [...tier1Cities, ...tier2Cities, ...tier3Cities];

  const unpublishedCities = allCitiesOrdered.filter(
    (c) => !publishedSet.has(c.slug)
  );

  if (unpublishedCities.length === 0) {
    return NextResponse.json({
      message: "All cities are already published",
      publishedCities: publishedSet.size,
    });
  }

  // Take the next batch
  const citiesToPublish = unpublishedCities.slice(0, CITIES_PER_RUN);
  const citySlugsToPublish = citiesToPublish.map((c) => c.slug);

  // Publish: set publishedAt = now() for all entries in these cities
  const result = await db.salaryEntry.updateMany({
    where: {
      citySlug: { in: citySlugsToPublish },
      publishedAt: null,
    },
    data: { publishedAt: new Date() },
  });

  // Revalidate hub pages so they reflect the new cities immediately
  // (leaf pages will self-revalidate within their ISR window)
  revalidatePath("/salaries", "layout");
  for (const city of citiesToPublish) {
    revalidatePath(`/salaries/${city.slug}`, "page");
  }

  // Ping Google to re-crawl the sitemap
  const sitemapUrl = `https://kitehr.co/sitemap.xml`;
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
  } catch {
    // Non-fatal — Google will re-crawl on its own schedule
  }

  return NextResponse.json({
    published: result.count,
    cities: citiesToPublish.map((c) => c.name),
    remainingCities: unpublishedCities.length - citiesToPublish.length,
    totalPublishedCities: publishedSet.size + citiesToPublish.length,
  });
}
