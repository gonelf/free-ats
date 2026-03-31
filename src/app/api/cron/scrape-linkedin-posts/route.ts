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

  // Allow manual override of result count from the dashboard
  const urlNum = request.nextUrl.searchParams.get("num");
  const searchNum = urlNum ? Math.min(100, Math.max(1, parseInt(urlNum, 10))) : 20;

  try {
    console.log("Starting LinkedIn scraper...");
    console.log("SERPER_API_KEY present:", !!process.env.SERPER_API_KEY);
    
    // Search for LinkedIn posts containing keywords for email applications
    // User suggested query for higher intent posts - works with site: at lower num results
    const query = '("we are hiring" OR "hiring now") ("email your CV" OR "send resume to" OR "email your resume to") site:linkedin.com/posts';
    
    // Pick a random page between 1 and 5 to find "more" instead of the same results each time
    const randomPage = Math.floor(Math.random() * 5) + 1;
    console.log(`Fetching from Serper.dev (Page ${randomPage}, 20 results)...`);
    
    const res = await fetch(SERPER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.SERPER_API_KEY!,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      body: JSON.stringify({
        q: query,
        tbs: "qdr:w", // past week
        page: randomPage,
        num: searchNum,      // User or default limit
      }),
    });

    console.log("Serper response status:", res.status);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = errorData.message || (await res.text()) || res.statusText;
      console.error("Serper API error:", errorMsg);
      
      if (res.status === 400 && errorMsg.includes("Query not allowed")) {
        throw new Error(`Serper Error: This query is restricted for LinkedIn (try a limit of 20 or less).`);
      }
      
      throw new Error(`Serper API error (${res.status}): ${errorMsg}`);
    }

    const data = (await res.json()) as SerperResponse;
    const items = data.organic ?? [];
    console.log(`Found ${items.length} organic results from Serper`);

    for (const item of items) {
      if (newLeads >= MAX_NEW) break;

      const sourceUrl = item.link;
      if (!sourceUrl) {
        console.log("Skipping item without link");
        continue;
      }

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
      console.log(`Processing result: ${item.title}`);

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
          console.log(`Skipping result (AI decision or missing data): ${extracted.skip ? "skip flag" : "missing email/company"}`);
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
        console.log(`Lead created: ${extracted.companyName}`);
      } catch (err) {
        console.error(`Error processing item ${item.title}:`, err);
        errors++;
      }
    }

    console.log(`Scraper finished. New leads: ${newLeads}, Skipped: ${skipped}, Errors: ${errors}`);

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
    console.error("LinkedIn scraper error:", message, error);
    
    try {
      await db.cronLog.create({
        data: {
          job: "scrape-linkedin-posts",
          status: "error",
          message,
          durationMs: Date.now() - startedAt,
        },
      });
    } catch (dbError) {
      console.error("Failed to log cron error to DB:", dbError);
    }

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
