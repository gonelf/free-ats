import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new posts to process per run. */
const MAX_NEW = 20;

const SERPER_API_URL = "https://google.serper.dev/search";

/**
 * Weekly/Daily cron that searches Google (via Serper.dev) for LinkedIn posts
 * where people are asking for email applications.
 *
 * Requires: SERPER_API_KEY env var from serper.dev
 *
 * Schedule: every 12 hours or daily
 * Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SERPER_API_KEY) {
    return NextResponse.json(
      { error: "SERPER_API_KEY not configured" },
      { status: 500 }
    );
  }

  let newLeads = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Search for LinkedIn posts containing keywords for email applications
    // using Google Search via Serper.dev
    const query = 'site:linkedin.com/posts "apply" "email"';
    
    const res = await fetch(SERPER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.SERPER_API_KEY,
      },
      body: JSON.stringify({
        q: query,
        tbs: "qdr:w", // past week
        num: 40,
      }),
    });

    if (!res.ok) {
      throw new Error(`Serper API error: ${res.status}`);
    }

    const data = (await res.json()) as SerperResponse;
    const items = data.organic ?? [];

    for (const item of items) {
      if (newLeads >= MAX_NEW) break;

      const sourceUrl = item.link;

      // Dedup by sourceUrl
      const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
      if (existing) {
        skipped++;
        continue;
      }

      // We use the snippet for extraction. If we wanted better results, 
      // we'd need to fetch the actual LinkedIn page, but LinkedIn blocks typical fetches.
      // Serper snippets are usually good enough to extract basics.
      const text = `${item.title}\n\n${item.snippet ?? ""}`;

      try {
        const extracted = await generateJSON<{
          skip?: boolean;
          companyName?: string;
          contactEmail?: string | null;
          contactName?: string | null;
          jobTitle?: string | null;
          hiringFor?: string | null;
          companyStage?: string | null;
        }>(
          flashModel,
          `Extract structured hiring data from this LinkedIn post search result.
Return JSON: {"companyName":"...","contactEmail":"...or null","contactName":"...or null","jobTitle":"...or null","hiringFor":"brief summary max 80 chars or null","companyStage":"startup|smb|enterprise"}
- If this is a job board aggregator, a large enterprise, or doesn't mention an email to apply, return: {"skip":true}

Search Result:
${text}`
        );

        if (extracted.skip || !extracted.contactEmail || !extracted.companyName) {
          continue;
        }

        await db.outreachLead.create({
          data: {
            companyName: extracted.companyName,
            contactEmail: extracted.contactEmail,
            contactName: extracted.contactName ?? null,
            hiringFor: extracted.jobTitle || extracted.hiringFor || null,
            companyStage: extracted.companyStage ?? "startup",
            source: "linkedin",
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
        job: "scrape-linkedin-posts",
        status: "success",
        message: `+${newLeads} leads, ${skipped} skipped, ${errors} errors`,
        details: { newLeads, skipped, errors, query },
        durationMs: Date.now() - startedAt,
      },
    });

    return NextResponse.json({ newLeads, skipped, errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.cronLog.create({
      data: {
        job: "scrape-linkedin-posts",
        status: "error",
        message,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Serper API types ──────────────────────────────────────────────────────────

interface SerperResult {
  title: string;
  link: string;
  snippet?: string;
  position: number;
}

interface SerperResponse {
  organic?: SerperResult[];
}
