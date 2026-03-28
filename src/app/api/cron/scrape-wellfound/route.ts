import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new leads to create per run. */
const MAX_NEW = 40;

const HN_ALGOLIA_SEARCH = "https://hn.algolia.com/api/v1/search_by_date";
const HN_ITEM_API = "https://hacker-news.firebaseio.com/v0/item";

/**
 * Daily cron that reads the latest "Ask HN: Who is Hiring?" thread and
 * extracts seed/Series A startups that are actively hiring.
 *
 * Replaced Wellfound scraping (which reliably returns 403 due to bot detection).
 * HN hiring threads are a direct signal of companies in the ATS ICP: small teams
 * posting jobs themselves, often pre-tooling.
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
    // Find the latest "Ask HN: Who is Hiring?" thread
    const searchRes = await fetch(
      `${HN_ALGOLIA_SEARCH}?query=%22Ask+HN%3A+Who+is+hiring%22&tags=story&hitsPerPage=1`,
      { headers: { "User-Agent": "KiteHR-Outreach/1.0" } }
    );
    if (!searchRes.ok) {
      throw new Error(`HN search failed: ${searchRes.status}`);
    }

    const searchData = (await searchRes.json()) as HnAlgoliaResponse;
    const story = searchData.hits?.[0];
    if (!story?.objectID) {
      throw new Error("No HN hiring thread found");
    }

    // Fetch the story to get top-level comment IDs
    const storyRes = await fetch(`${HN_ITEM_API}/${story.objectID}.json`);
    if (!storyRes.ok) {
      throw new Error(`HN story fetch failed: ${storyRes.status}`);
    }
    const storyData = (await storyRes.json()) as HnItem;
    const commentIds = (storyData.kids ?? []).slice(0, MAX_NEW * 3);

    for (const commentId of commentIds) {
      if (newLeads >= MAX_NEW) break;

      let comment: HnItem;
      try {
        const commentRes = await fetch(`${HN_ITEM_API}/${commentId}.json`);
        if (!commentRes.ok) continue;
        comment = (await commentRes.json()) as HnItem;
      } catch {
        errors++;
        continue;
      }

      if (!comment?.text || comment.deleted || comment.dead) continue;

      const sourceUrl = `https://news.ycombinator.com/item?id=${commentId}`;

      const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
      if (existing) {
        skipped++;
        continue;
      }

      // Decode HTML entities and strip tags
      const text = comment.text
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1500);

      try {
        const extracted = await generateJSON<{
          skip?: boolean;
          companyName?: string;
          website?: string | null;
          hiringFor?: string | null;
          companyStage?: string | null;
        }>(
          flashModel,
          `Extract company data from this Hacker News "Who is Hiring?" comment.
Return JSON: {"companyName":"...","website":"...or null","hiringFor":"roles they are hiring for, max 80 chars or null","companyStage":"seed|series_a|series_b|unknown"}
- Return {"skip":true} if: this is a recruiter post (not the company itself), a large enterprise (500+ employees), or no clear company name is present.

Comment:
${text}`
        );

        if (extracted.skip || !extracted.companyName) continue;

        await db.outreachLead.create({
          data: {
            companyName: extracted.companyName,
            website: extracted.website ?? null,
            hiringFor: extracted.hiringFor ?? null,
            companyStage: extracted.companyStage ?? "startup",
            source: "hn_hiring",
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
        details: { newLeads, skipped, errors, hnStoryId: story.objectID },
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

interface HnAlgoliaResponse {
  hits?: Array<{ objectID: string; title?: string }>;
}

interface HnItem {
  id: number;
  text?: string;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
}
