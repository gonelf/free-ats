import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new (unseen) comments to send through AI per cron run. */
const MAX_NEW = 100;

/**
 * Daily cron that scrapes the latest HN "Ask HN: Who is hiring?" thread.
 * HN posts the thread on the 1st but companies comment throughout the month,
 * so we run daily and rely on per-comment sourceUrl dedup to skip seen posts.
 *
 * Schedule: daily at 10:00 UTC
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
    // 1. Find the latest "Who is hiring?" thread via Algolia HN search
    const searchRes = await fetch(
      "https://hn.algolia.com/api/v1/search?query=Ask+HN+Who+is+hiring&tags=ask_hn&hitsPerPage=5&attributesToRetrieve=objectID,title&restrictSearchableAttributes=title"
    );
    const searchData = (await searchRes.json()) as {
      hits: { objectID: string; title: string }[];
    };

    const thread = searchData.hits.find(
      (h) => /ask hn: who is hiring/i.test(h.title)
    );

    if (!thread) {
      await db.cronLog.create({
        data: {
          job: "scrape-hn-hiring",
          status: "skipped",
          message: "No 'Who is hiring?' thread found on HN",
          durationMs: Date.now() - startedAt,
        },
      });
      return NextResponse.json({ skipped: true, reason: "Thread not found" });
    }

    const threadId = parseInt(thread.objectID, 10);

    // 2. Fetch thread to get comment IDs
    const threadRes = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${threadId}.json`
    );
    const threadData = (await threadRes.json()) as {
      kids?: number[];
      title?: string;
    };

    if (!threadData.kids?.length) {
      await db.cronLog.create({
        data: {
          job: "scrape-hn-hiring",
          status: "skipped",
          message: `Thread ${threadId} has no comments`,
          durationMs: Date.now() - startedAt,
        },
      });
      return NextResponse.json({ skipped: true, reason: "No comments" });
    }

    const commentIds = threadData.kids;

    // 3. Process in small batches, capped at MAX_NEW new leads via AI
    const BATCH = 5;
    let newProcessed = 0;
    let limitReached = false;

    outer: for (let i = 0; i < commentIds.length; i += BATCH) {
      const batch = commentIds.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (commentId) => {
          if (newProcessed >= MAX_NEW) return;
          try {
            const itemRes = await fetch(
              `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`
            );
            const item = (await itemRes.json()) as { text?: string; id: number };
            if (!item?.text) return;

            const sourceUrl = `https://news.ycombinator.com/item?id=${item.id}`;

            // Skip duplicates (fast, no AI)
            const existing = await db.outreachLead.findFirst({
              where: { sourceUrl },
            });
            if (existing) {
              skipped++;
              return;
            }

            if (newProcessed >= MAX_NEW) return;

            // Extract lead info with AI
            const clean = item.text
              .replace(/<[^>]+>/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&#x27;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 1500);

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
              `Extract structured hiring data from this HN "Who is Hiring?" comment.
Return JSON: {"companyName":"...","website":"...or null","contactEmail":"...or null","contactName":"...or null","hiringFor":"brief summary max 100 chars or null","companyStage":"startup|smb|enterprise"}
- companyStage "startup": seed/Series A/B, early-stage, small team (<50 people), bootstrapped, recently founded
- companyStage "smb": established small/mid-size business, Series C+, 50-200 employees
- companyStage "enterprise": public company, Fortune 500, FAANG, large corporation, >200 employees
If not a real job posting, return: {"skip":true}

Comment:
${clean}`
            );

            if (extracted.skip || !extracted.companyName) return;
            // Skip enterprise companies — they already have ATS solutions
            if (extracted.companyStage === "enterprise") {
              skipped++;
              return;
            }

            await db.outreachLead.create({
              data: {
                companyName: extracted.companyName,
                website: extracted.website ?? null,
                contactEmail: extracted.contactEmail ?? null,
                contactName: extracted.contactName ?? null,
                hiringFor: extracted.hiringFor ?? null,
                companyStage: extracted.companyStage ?? null,
                source: "hn_hiring",
                sourceUrl,
                status: "new",
              },
            });
            newLeads++;
            newProcessed++;
          } catch {
            errors++;
          }
        })
      );

      if (newProcessed >= MAX_NEW) {
        limitReached = true;
        break outer;
      }
    }

    await db.cronLog.create({
      data: {
        job: "scrape-hn-hiring",
        status: "success",
        message: `Thread ${threadId} ("${thread.title}"): +${newLeads} leads, ${skipped} skipped, ${errors} errors${limitReached ? ` (limit ${MAX_NEW} reached)` : ""}`,
        details: { threadId, threadTitle: thread.title, newLeads, skipped, errors, limitReached },
        durationMs: Date.now() - startedAt,
      },
    });

    return NextResponse.json({ threadId, newLeads, skipped, errors, limitReached });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.cronLog.create({
      data: {
        job: "scrape-hn-hiring",
        status: "error",
        message,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
