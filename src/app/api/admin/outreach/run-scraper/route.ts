import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";

const VALID_SOURCES = ["reddit", "product_hunt", "yc", "techcrunch_funding", "linkedin"] as const;
type ScraperSource = (typeof VALID_SOURCES)[number];

const CRON_PATHS: Record<ScraperSource, string> = {
  reddit: "/api/cron/scrape-reddit-hiring",
  product_hunt: "/api/cron/scrape-product-hunt",
  yc: "/api/cron/scrape-yc-companies",
  techcrunch_funding: "/api/cron/scrape-techcrunch-funding",
  linkedin: "/api/cron/scrape-linkedin-posts",
};

/**
 * Admin-protected endpoint that manually triggers one of the non-HN scrapers.
 * Proxies to the cron route using CRON_SECRET for auth.
 *
 * POST /api/admin/outreach/run-scraper?source=reddit|product_hunt|yc
 */
export async function POST(request: NextRequest) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = request.nextUrl.searchParams.get("source") as ScraperSource | null;
  if (!source || !VALID_SOURCES.includes(source)) {
    return NextResponse.json(
      { error: `Invalid source. Must be one of: ${VALID_SOURCES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  // Build base URL from the incoming request
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const num = request.nextUrl.searchParams.get("num");
  const cronUrl = new URL(`${baseUrl}${CRON_PATHS[source]}`);
  if (num) cronUrl.searchParams.set("num", num);

  const cronRes = await fetch(cronUrl.toString(), {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });

  const data = await cronRes.json();

  if (!cronRes.ok) {
    return NextResponse.json(data, { status: cronRes.status });
  }

  return NextResponse.json(data);
}
