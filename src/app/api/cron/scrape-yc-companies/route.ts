import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 300;

/** Max new leads to create per run. */
const MAX_NEW = 50;

/** Only include companies from these recent batches. */
const MIN_BATCH_YEAR = 2022;

/**
 * Weekly cron that fetches recent YC-backed companies from the public YC API.
 * YC companies (especially recent batches) are small, well-funded, tech-savvy
 * startups about to scale hiring — perfect free ATS candidates.
 *
 * Uses the public YC company search API (no auth required).
 *
 * Schedule: every Monday at 09:00 UTC
 * Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let newLeads = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // YC public company search API — filter for active companies, sorted by batch
    // This API is used by ycombinator.com/companies and is publicly accessible
    const res = await fetch(
      "https://api.ycombinator.com/v0.1/companies?app_answers=false&nonprofit=false&isHiring=true&page=1",
      { headers: { "User-Agent": "KiteHR-Outreach/1.0" } }
    );

    if (!res.ok) {
      throw new Error(`YC API error: ${res.status}`);
    }

    const data = (await res.json()) as YCResponse;
    const companies = data.companies ?? [];

    for (const company of companies) {
      if (newLeads >= MAX_NEW) break;

      // Only recent batches
      const batchYear = parseBatchYear(company.batch);
      if (batchYear && batchYear < MIN_BATCH_YEAR) {
        skipped++;
        continue;
      }

      // Skip companies with no website — can't enrich them
      if (!company.website) {
        skipped++;
        continue;
      }

      const sourceUrl = `https://www.ycombinator.com/companies/${company.slug}`;

      // Dedup by sourceUrl
      const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
      if (existing) {
        skipped++;
        continue;
      }

      try {
        await db.outreachLead.create({
          data: {
            companyName: company.name,
            website: company.website,
            contactEmail: null, // Will be found later via "Find Contacts" enrichment
            contactName: null,
            hiringFor: company.one_liner?.slice(0, 100) ?? null,
            companyStage: "startup",
            source: "yc",
            sourceUrl,
            status: "new",
          },
        });
        newLeads++;
      } catch {
        errors++;
      }
    }

    await db.cronLog.create({
      data: {
        job: "scrape-yc-companies",
        status: "success",
        message: `+${newLeads} leads, ${skipped} skipped, ${errors} errors`,
        details: { newLeads, skipped, errors, minBatchYear: MIN_BATCH_YEAR },
        durationMs: Date.now() - startedAt,
      },
    });

    return NextResponse.json({ newLeads, skipped, errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.cronLog.create({
      data: {
        job: "scrape-yc-companies",
        status: "error",
        message,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Parse year from YC batch string like "W22", "S23", "W25". */
function parseBatchYear(batch?: string): number | null {
  if (!batch) return null;
  const match = batch.match(/(\d{2})$/);
  if (!match) return null;
  return 2000 + parseInt(match[1], 10);
}

// ─── YC API types ─────────────────────────────────────────────────────────────

interface YCCompany {
  id: number;
  name: string;
  slug: string;
  website?: string;
  one_liner?: string;
  batch?: string;
  status?: string;
  team_size?: number;
}

interface YCResponse {
  companies?: YCCompany[];
}
