import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new leads to create per run. */
const MAX_NEW = 30;

/**
 * Funding range that maps to our ICP: post-seed to early Series A.
 * Companies raising less than $500K are pre-product; above $20M they likely
 * already have HR tooling in place.
 */
const MIN_FUNDING_USD = 500_000;
const MAX_FUNDING_USD = 20_000_000;

const TC_FUNDING_RSS = "https://techcrunch.com/category/funding/feed/";

/**
 * Daily cron that reads TechCrunch's funding RSS feed and extracts companies
 * that just raised a seed or Series A round.
 *
 * "Just raised" is the single best trigger for ATS interest: the company is
 * about to scale hiring and hasn't yet set up proper tooling.
 *
 * Schedule: daily at 14:00 UTC
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
    const res = await fetch(TC_FUNDING_RSS, {
      headers: { "User-Agent": "KiteHR-Outreach/1.0" },
    });

    if (!res.ok) {
      throw new Error(`TechCrunch RSS fetch failed: ${res.status}`);
    }

    const xml = await res.text();
    const items = parseRssItems(xml);

    for (const item of items) {
      if (newLeads >= MAX_NEW) break;

      const sourceUrl = item.link;
      if (!sourceUrl) continue;

      const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
      if (existing) {
        skipped++;
        continue;
      }

      const content = `Title: ${item.title}\n\n${item.description ?? ""}`.trim().slice(0, 2000);

      try {
        const extracted = await generateJSON<{
          skip?: boolean;
          companyName?: string;
          website?: string | null;
          fundingAmountUsd?: number | null;
          hiringFor?: string | null;
        }>(
          flashModel,
          `Extract company funding data from this TechCrunch article.
Return JSON: {"companyName":"...","website":"...or null","fundingAmountUsd":number_or_null,"hiringFor":"roles they are likely hiring for based on their business, max 80 chars or null"}
- fundingAmountUsd: funding amount as a plain integer in USD (e.g. 5000000 for $5M). Return null if unclear.
- Return {"skip":true} if: this is a roundup/multiple-company article, a VC fund raise (not a company), an acquisition, or the company is clearly a large enterprise.

Article:
${content}`
        );

        if (extracted.skip || !extracted.companyName) continue;

        // Filter to ICP funding range
        const amount = extracted.fundingAmountUsd;
        if (amount !== null && amount !== undefined) {
          if (amount < MIN_FUNDING_USD || amount > MAX_FUNDING_USD) {
            skipped++;
            continue;
          }
        }

        await db.outreachLead.create({
          data: {
            companyName: extracted.companyName,
            website: extracted.website ?? null,
            hiringFor: extracted.hiringFor ?? null,
            companyStage: "startup",
            source: "techcrunch_funding",
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
        job: "scrape-techcrunch-funding",
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
        job: "scrape-techcrunch-funding",
        status: "error",
        message,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RssItem {
  title: string;
  link: string;
  description?: string;
}

// ─── RSS parsing ──────────────────────────────────────────────────────────────

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];

  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const title = extractRssTag(block, "title");
    const link = extractRssTag(block, "link") ?? extractRssTag(block, "guid");
    if (!title || !link) continue;

    const description = extractRssTag(block, "description");
    items.push({ title, link, description });
  }

  return items;
}

function extractRssTag(xml: string, tag: string): string | undefined {
  // Handle CDATA: <tag><![CDATA[...]]></tag>
  const cdataMatch = xml.match(
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i")
  );
  if (cdataMatch) return cdataMatch[1].trim();

  // Plain text content
  const plainMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return plainMatch ? plainMatch[1].trim() : undefined;
}
