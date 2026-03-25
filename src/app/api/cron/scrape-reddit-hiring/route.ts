import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new posts to process per cron run. */
const MAX_NEW = 50;

const TARGET_SUBREDDITS = ["startups", "smallbusiness", "forhire", "entrepreneur"];

/**
 * Daily cron that scrapes Reddit hiring posts from startup/SMB-focused subreddits.
 * Uses Reddit's public JSON API (no auth required for read-only access).
 * Targets small companies that are the ideal free ATS customers.
 *
 * Schedule: daily at 11:00 UTC
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
  let newProcessed = 0;

  try {
    for (const subreddit of TARGET_SUBREDDITS) {
      if (newProcessed >= MAX_NEW) break;

      // Fetch top "hiring" posts from this week via Reddit public JSON API
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=hiring+OR+%22we%27re+hiring%22+OR+%22now+hiring%22&sort=new&t=week&limit=25&restrict_sr=1`;

      let posts: RedditPost[];
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "KiteHR-Outreach/1.0" },
        });
        if (!res.ok) {
          errors++;
          continue;
        }
        const data = (await res.json()) as RedditListing;
        posts = data.data?.children?.map((c) => c.data) ?? [];
      } catch {
        errors++;
        continue;
      }

      for (const post of posts) {
        if (newProcessed >= MAX_NEW) break;

        const sourceUrl = `https://www.reddit.com${post.permalink}`;

        // Dedup by sourceUrl
        const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
        if (existing) {
          skipped++;
          continue;
        }

        // Combine title + selftext for extraction
        const text = `${post.title}\n\n${post.selftext ?? ""}`.trim().slice(0, 1500);

        try {
          const extracted = await generateJSON<{
            skip?: boolean;
            companyName?: string;
            website?: string | null;
            contactEmail?: string | null;
            contactName?: string | null;
            hiringFor?: string | null;
            companyStage?: string | null;
          }>(
            flashModel,
            `Extract structured hiring data from this Reddit post in r/${subreddit}.
Return JSON: {"companyName":"...","website":"...or null","contactEmail":"...or null","contactName":"...or null","hiringFor":"brief summary max 100 chars or null","companyStage":"startup|smb|enterprise"}
- companyStage "startup": seed/Series A/B, early-stage, small team (<50 people), bootstrapped, recently founded
- companyStage "smb": established small/mid-size business, 50-200 employees
- companyStage "enterprise": public company, Fortune 500, large corporation, >200 employees
If this is not a genuine company hiring post (e.g. individual job seeker, spam, off-topic), return: {"skip":true}

Post:
${text}`
          );

          if (extracted.skip || !extracted.companyName) {
            continue;
          }

          // Skip enterprise — they don't need a free ATS
          if (extracted.companyStage === "enterprise") {
            skipped++;
            continue;
          }

          await db.outreachLead.create({
            data: {
              companyName: extracted.companyName,
              website: extracted.website ?? null,
              contactEmail: extracted.contactEmail ?? null,
              contactName: extracted.contactName ?? null,
              hiringFor: extracted.hiringFor ?? null,
              companyStage: extracted.companyStage ?? "startup",
              source: "reddit",
              sourceUrl,
              status: "new",
            },
          });
          newLeads++;
          newProcessed++;
        } catch {
          errors++;
        }
      }
    }

    await db.cronLog.create({
      data: {
        job: "scrape-reddit-hiring",
        status: "success",
        message: `+${newLeads} leads, ${skipped} skipped, ${errors} errors`,
        details: { newLeads, skipped, errors, subreddits: TARGET_SUBREDDITS },
        durationMs: Date.now() - startedAt,
      },
    });

    return NextResponse.json({ newLeads, skipped, errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.cronLog.create({
      data: {
        job: "scrape-reddit-hiring",
        status: "error",
        message,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Reddit API types ─────────────────────────────────────────────────────────

interface RedditPost {
  title: string;
  selftext?: string;
  permalink: string;
  url?: string;
  author?: string;
}

interface RedditListing {
  data?: {
    children?: { data: RedditPost }[];
  };
}
