import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export async function POST() {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
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
      return NextResponse.json({ skipped: true, reason: "No comments" });
    }

    const commentIds = threadData.kids;

    // 3. Process in small batches to stay within rate limits
    const BATCH = 5;
    for (let i = 0; i < commentIds.length; i += BATCH) {
      const batch = commentIds.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (commentId) => {
          try {
            const itemRes = await fetch(
              `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`
            );
            const item = (await itemRes.json()) as { text?: string; id: number };
            if (!item?.text) return;

            const sourceUrl = `https://news.ycombinator.com/item?id=${item.id}`;

            // Skip duplicates
            const existing = await db.outreachLead.findFirst({
              where: { sourceUrl },
            });
            if (existing) {
              skipped++;
              return;
            }

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
            }>(
              flashModel,
              `Extract structured hiring data from this HN "Who is Hiring?" comment.
Return JSON: {"companyName":"...","website":"...or null","contactEmail":"...or null","contactName":"...or null","hiringFor":"brief summary max 100 chars or null"}
If not a real job posting, return: {"skip":true}

Comment:
${clean}`
            );

            if (extracted.skip || !extracted.companyName) return;

            await db.outreachLead.create({
              data: {
                companyName: extracted.companyName,
                website: extracted.website ?? null,
                contactEmail: extracted.contactEmail ?? null,
                contactName: extracted.contactName ?? null,
                hiringFor: extracted.hiringFor ?? null,
                source: "hn_hiring",
                sourceUrl,
                status: "new",
              },
            });
            newLeads++;
          } catch {
            errors++;
          }
        })
      );
    }

    await db.cronLog.create({
      data: {
        job: "scrape-hn-hiring",
        status: "success",
        message: `Manual run by admin: Thread ${threadId} ("${thread.title}"): +${newLeads} leads, ${skipped} skipped, ${errors} errors`,
        details: { threadId, threadTitle: thread.title, newLeads, skipped, errors },
        durationMs: Date.now() - startedAt,
      },
    });

    return NextResponse.json({ threadId, newLeads, skipped, errors });
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
