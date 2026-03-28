import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new leads to create per run. */
const MAX_NEW = 40;

/**
 * Daily cron that scrapes Wellfound (AngelList Talent) for seed/Series A startups
 * that are actively hiring. These companies are in the exact ICP — small teams
 * (1–50 people) with open roles but no ATS yet.
 *
 * Schedule: daily at 13:00 UTC
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
    // Target Seed + Series A startups that are hiring
    const url =
      "https://wellfound.com/startups?filter_by_stage[]=Seed&filter_by_stage[]=Series+A&hiring=true";

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!res.ok) {
      throw new Error(`Wellfound fetch failed: ${res.status}`);
    }

    const html = await res.text();

    // Attempt 1: extract Next.js embedded page data
    let companies: WellfoundCompany[] = [];
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
    );

    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]) as NextData;
        companies = extractCompaniesFromNextData(nextData);
      } catch {
        // fall through to AI extraction
      }
    }

    // Attempt 2: use Gemini to extract companies from visible page text
    if (companies.length === 0) {
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 6000);

      const result = await generateJSON<{ companies?: WellfoundCompany[] }>(
        flashModel,
        `Extract startup companies listed on this Wellfound directory page.
Return JSON: {"companies":[{"name":"...","slug":"...or null","website":"...or null","description":"...or null"}]}
Only include companies explicitly listed on the page. Return {"companies":[]} if none found.

Page text:
${text}`
      );
      companies = result.companies ?? [];
    }

    for (const company of companies) {
      if (newLeads >= MAX_NEW) break;

      const slug =
        company.slug ??
        company.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      const sourceUrl = `https://wellfound.com/company/${slug}`;

      const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
      if (existing) {
        skipped++;
        continue;
      }

      try {
        await db.outreachLead.create({
          data: {
            companyName: company.name,
            website: company.website ?? null,
            hiringFor: company.description
              ? company.description.slice(0, 150)
              : null,
            companyStage: "startup",
            source: "wellfound",
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
        job: "scrape-wellfound",
        status: "success",
        message: `+${newLeads} leads, ${skipped} skipped, ${errors} errors`,
        details: { newLeads, skipped, errors },
        durationMs: Date.now() - startedAt,
      },
    });

    return NextResponse.json({ newLeads, skipped, errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.cronLog.create({
      data: {
        job: "scrape-wellfound",
        status: "error",
        message,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WellfoundCompany {
  name: string;
  slug?: string | null;
  website?: string | null;
  description?: string | null;
}

interface NextData {
  props?: {
    pageProps?: Record<string, unknown>;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractCompaniesFromNextData(nextData: NextData): WellfoundCompany[] {
  try {
    const pageProps = nextData?.props?.pageProps;
    if (!pageProps) return [];

    // Wellfound may store listings under different keys depending on page version
    for (const key of ["startups", "companies", "results", "listings"]) {
      const candidate = pageProps[key];
      if (Array.isArray(candidate) && candidate.length > 0) {
        return candidate as WellfoundCompany[];
      }
    }
    return [];
  } catch {
    return [];
  }
}
