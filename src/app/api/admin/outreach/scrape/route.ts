import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new (unseen) comments to send through AI per manual run. */
const MAX_NEW = 50;

export async function POST() {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const startedAt = Date.now();
  let newLeads = 0;
  let skipped = 0;
  let errors = 0;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: "status", message: "Searching for latest HN hiring thread…" });

        // 1. Find the latest "Who is hiring?" thread via Algolia
        const searchRes = await fetch(
          "https://hn.algolia.com/api/v1/search?query=Ask+HN+Who+is+hiring&tags=ask_hn&hitsPerPage=5&attributesToRetrieve=objectID,title&restrictSearchableAttributes=title"
        );
        const searchData = (await searchRes.json()) as {
          hits: { objectID: string; title: string }[];
        };

        const thread = searchData.hits.find((h) => /ask hn: who is hiring/i.test(h.title));

        if (!thread) {
          send({ type: "error", message: "No 'Who is Hiring?' thread found on HN" });
          controller.close();
          return;
        }

        const threadId = parseInt(thread.objectID, 10);
        send({ type: "thread", id: threadId, title: thread.title });

        // 2. Fetch comment IDs
        send({ type: "status", message: "Fetching comment list…" });
        const threadRes = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${threadId}.json`
        );
        const threadData = (await threadRes.json()) as {
          kids?: number[];
        };

        if (!threadData.kids?.length) {
          send({ type: "error", message: "Thread has no comments" });
          controller.close();
          return;
        }

        const commentIds = threadData.kids;
        const total = commentIds.length;
        send({
          type: "total",
          total,
          limit: MAX_NEW,
          message: `Found ${total} comments — processing up to ${MAX_NEW} new ones`,
        });

        // 3. Process in batches of 5 until we hit the limit
        const BATCH = 5;
        let processed = 0;
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
                processed++;

                if (!item?.text) {
                  send({ type: "progress", processed, total, newLeads, skipped, errors });
                  return;
                }

                const sourceUrl = `https://news.ycombinator.com/item?id=${item.id}`;

                // Skip duplicates (fast DB lookup, no AI)
                const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
                if (existing) {
                  skipped++;
                  send({ type: "progress", processed, total, newLeads, skipped, errors });
                  return;
                }

                // Reached AI limit — count as pending, don't process
                if (newProcessed >= MAX_NEW) return;

                // Clean HTML
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

                send({
                  type: "parsing",
                  processed,
                  total,
                  newLeads,
                  skipped,
                  errors,
                  preview: clean.slice(0, 100),
                });

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

                if (extracted.skip || !extracted.companyName) {
                  send({ type: "progress", processed, total, newLeads, skipped, errors });
                  return;
                }

                // Skip enterprise companies — they already have ATS solutions
                if (extracted.companyStage === "enterprise") {
                  skipped++;
                  send({ type: "progress", processed, total, newLeads, skipped, errors });
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
                send({
                  type: "lead",
                  company: extracted.companyName,
                  hiringFor: extracted.hiringFor ?? null,
                  processed,
                  total,
                  newLeads,
                  skipped,
                  errors,
                });
              } catch {
                errors++;
                send({ type: "progress", processed, total, newLeads, skipped, errors });
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
            message: `Manual run: Thread ${threadId} ("${thread.title}"): +${newLeads} leads, ${skipped} skipped, ${errors} errors${limitReached ? ` (limit ${MAX_NEW} reached)` : ""}`,
            details: { threadId, threadTitle: thread.title, newLeads, skipped, errors, limitReached },
            durationMs: Date.now() - startedAt,
          },
        });

        send({
          type: "done",
          newLeads,
          skipped,
          errors,
          threadId,
          threadTitle: thread.title,
          limitReached,
          limit: MAX_NEW,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        try {
          await db.cronLog.create({
            data: {
              job: "scrape-hn-hiring",
              status: "error",
              message,
              durationMs: Date.now() - startedAt,
            },
          });
        } catch {
          // ignore secondary failure
        }
        send({ type: "error", message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
