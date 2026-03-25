/**
 * KiteHR Outreach — HN "Who is Hiring?" Scraper
 *
 * Scrapes the latest Hacker News "Ask HN: Who is hiring?" thread,
 * extracts company/contact info from each comment using Gemini Flash,
 * and upserts leads into the OutreachLead table.
 *
 * Usage:
 *   npx tsx scripts/scrape-hn-hiring.ts
 *   npx tsx scripts/scrape-hn-hiring.ts --dry-run     # preview without DB writes
 *   npx tsx scripts/scrape-hn-hiring.ts --limit 50    # process first 50 comments
 *   npx tsx scripts/scrape-hn-hiring.ts --thread 12345 # use specific HN item ID
 *
 * Prerequisites:
 *   - GOOGLE_GENERATIVE_AI_API_KEY in .env
 *   - DATABASE_URL in .env
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Config ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT = (() => {
  const idx = args.indexOf("--limit");
  return idx !== -1 ? parseInt(args[idx + 1], 10) : Infinity;
})();
const FORCED_THREAD_ID = (() => {
  const idx = args.indexOf("--thread");
  return idx !== -1 ? parseInt(args[idx + 1], 10) : null;
})();

const CONCURRENCY = 5; // parallel Gemini requests
const DELAY_MS = 200;  // ms between batches to avoid rate limits

// ─── Prisma ───────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const db = new PrismaClient({ adapter });

// ─── Gemini ───────────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── HN API helpers ───────────────────────────────────────────────────────────

interface HNItem {
  id: number;
  type: string;
  text?: string;
  title?: string;
  by?: string;
  kids?: number[];
  url?: string;
  time?: number;
}

async function fetchHNItem(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    return (await res.json()) as HNItem;
  } catch {
    return null;
  }
}

async function findLatestHiringThread(): Promise<number> {
  // Use Algolia HN search to find the latest "Who is hiring?" thread
  const url =
    "https://hn.algolia.com/api/v1/search?query=Ask+HN+Who+is+hiring&tags=ask_hn&hitsPerPage=5&attributesToRetrieve=objectID,title&restrictSearchableAttributes=title";
  const res = await fetch(url);
  const data = (await res.json()) as {
    hits: { objectID: string; title: string }[];
  };

  const thread = data.hits.find(
    (h) =>
      /ask hn: who is hiring/i.test(h.title) &&
      !/hiring who/i.test(h.title)
  );

  if (!thread) {
    throw new Error("Could not find a 'Who is hiring?' thread on HN");
  }

  console.log(`Found thread: "${thread.title}" (ID: ${thread.objectID})`);
  return parseInt(thread.objectID, 10);
}

// ─── AI extraction ────────────────────────────────────────────────────────────

interface ExtractedLead {
  companyName: string;
  website: string | null;
  contactEmail: string | null;
  contactName: string | null;
  hiringFor: string | null;
  companyStage: string | null;
}

const SYSTEM_PROMPT = `You are extracting structured data from Hacker News "Who is Hiring?" comments.

Each comment is posted by a company or recruiter. Extract:
- companyName: the company name (required)
- website: the company website URL if mentioned (or null)
- contactEmail: the email address to reach for hiring inquiries (or null)
- contactName: the name of the person posting if mentioned (or null)
- hiringFor: a brief summary (max 100 chars) of what roles they are hiring for
- companyStage: classify as "startup" (seed/Series A/B, early-stage, <50 people, bootstrapped), "smb" (50-200 employees, Series C+), or "enterprise" (public company, Fortune 500, FAANG, >200 employees)

Return ONLY valid JSON like: {"companyName":"Acme","website":"acme.com","contactEmail":"jobs@acme.com","contactName":"Jane","hiringFor":"Senior engineers, remote","companyStage":"startup"}

If the comment is not a real job posting (e.g. it's a meta comment, off-topic, or spam), return: {"skip":true}`;

async function extractLeadFromComment(
  text: string
): Promise<ExtractedLead | null> {
  // Strip HTML tags
  const clean = text
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500); // cap at 1500 chars to keep costs low

  const prompt = `${SYSTEM_PROMPT}\n\nComment:\n${clean}`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip possible markdown fences
    const jsonStr =
      raw.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ??
      raw.match(/(\{[\s\S]*\})/)?.[1] ??
      raw;

    const parsed = JSON.parse(jsonStr);
    if (parsed.skip) return null;
    return parsed as ExtractedLead;
  } catch {
    return null;
  }
}

// ─── Batch helpers ────────────────────────────────────────────────────────────

async function processBatch(ids: number[]): Promise<void> {
  const items = await Promise.all(ids.map(fetchHNItem));

  for (const item of items) {
    if (!item || !item.text) continue;

    const lead = await extractLeadFromComment(item.text);
    if (!lead || !lead.companyName) continue;

    const sourceUrl = `https://news.ycombinator.com/item?id=${item.id}`;

    // Skip enterprise companies — they already have ATS solutions
    if (lead.companyStage === "enterprise") {
      console.log(`  [SKIP] ${lead.companyName} is enterprise`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [DRY] ${lead.companyName} | ${lead.companyStage ?? "?"} | ${lead.contactEmail ?? "no email"} | ${lead.hiringFor ?? ""}`);
      continue;
    }

    // Upsert: same sourceUrl = same comment, don't duplicate
    const existing = await db.outreachLead.findFirst({
      where: { sourceUrl },
    });

    if (existing) {
      console.log(`  [SKIP] ${lead.companyName} already exists`);
      continue;
    }

    await db.outreachLead.create({
      data: {
        companyName: lead.companyName,
        website: lead.website ?? null,
        contactEmail: lead.contactEmail ?? null,
        contactName: lead.contactName ?? null,
        hiringFor: lead.hiringFor ?? null,
        companyStage: lead.companyStage ?? null,
        source: "hn_hiring",
        sourceUrl,
        status: "new",
      },
    });

    console.log(`  [+] ${lead.companyName} | ${lead.companyStage ?? "?"} | ${lead.contactEmail ?? "no email"} | ${lead.hiringFor ?? ""}`);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nKiteHR — HN "Who is Hiring?" Scraper`);
  if (DRY_RUN) console.log("  Mode: DRY RUN (no DB writes)\n");

  // 1. Find the thread
  const threadId = FORCED_THREAD_ID ?? (await findLatestHiringThread());
  const thread = await fetchHNItem(threadId);

  if (!thread || !thread.kids?.length) {
    console.error("Thread not found or has no comments.");
    process.exit(1);
  }

  const commentIds = thread.kids.slice(0, LIMIT === Infinity ? undefined : LIMIT);
  console.log(`Processing ${commentIds.length} comments from thread ${threadId}\n`);

  // 2. Process in batches
  let processed = 0;
  for (let i = 0; i < commentIds.length; i += CONCURRENCY) {
    const batch = commentIds.slice(i, i + CONCURRENCY);
    await processBatch(batch);
    processed += batch.length;
    process.stdout.write(`\r  Progress: ${processed}/${commentIds.length}`);
    if (i + CONCURRENCY < commentIds.length) await sleep(DELAY_MS);
  }

  console.log("\n\nDone.");
  await db.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
