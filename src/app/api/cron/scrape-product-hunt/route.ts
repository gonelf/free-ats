import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, flashModel } from "@/lib/ai/gemini";

export const maxDuration = 300;

/** Max new leads to create per run. */
const MAX_NEW = 40;

const PH_API_URL = "https://api.producthunt.com/v2/api/graphql";

/**
 * Daily cron that scrapes recent Product Hunt launches.
 * PH makers are typically small teams (1–20 people) who just launched a product
 * and are about to start scaling their hiring — ideal free ATS candidates.
 *
 * Requires: PRODUCT_HUNT_API_TOKEN env var (developer token from producthunt.com/v2/oauth/applications)
 *
 * Schedule: daily at 12:00 UTC
 * Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.PRODUCT_HUNT_API_TOKEN) {
    return NextResponse.json(
      { error: "PRODUCT_HUNT_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  let newLeads = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Fetch posts from the last 7 days via PH GraphQL API
    const query = `
      query {
        posts(order: NEWEST, postedBefore: "${new Date().toISOString()}", first: 50) {
          edges {
            node {
              id
              name
              tagline
              description
              url
              website
              makers {
                name
                username
                websiteUrl
              }
            }
          }
        }
      }
    `;

    const res = await fetch(PH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PRODUCT_HUNT_API_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`Product Hunt API error: ${res.status}`);
    }

    const data = (await res.json()) as PHResponse;
    const posts = data.data?.posts?.edges?.map((e) => e.node) ?? [];

    for (const post of posts) {
      if (newLeads >= MAX_NEW) break;

      const sourceUrl = post.url;

      // Dedup by sourceUrl
      const existing = await db.outreachLead.findFirst({ where: { sourceUrl } });
      if (existing) {
        skipped++;
        continue;
      }

      const makerName = post.makers?.[0]?.name ?? null;
      const website = post.website ?? post.makers?.[0]?.websiteUrl ?? null;

      // Build a description for AI extraction
      const description = [
        `Product: ${post.name}`,
        `Tagline: ${post.tagline}`,
        post.description ? `Description: ${post.description}` : "",
        makerName ? `Maker: ${makerName}` : "",
        website ? `Website: ${website}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const extracted = await generateJSON<{
          skip?: boolean;
          companyName?: string;
          contactEmail?: string | null;
          hiringFor?: string | null;
        }>(
          flashModel,
          `Given this Product Hunt product launch, determine if this represents a small tech company that could benefit from an Applicant Tracking System (ATS).
Return JSON: {"companyName":"...","contactEmail":"...or null","hiringFor":"what roles they might be hiring for based on their product, max 80 chars or null"}
- If this is a solo project, a huge company's product, or clearly not a hirable business, return: {"skip":true}

Product Hunt post:
${description}`
        );

        if (extracted.skip || !extracted.companyName) {
          continue;
        }

        await db.outreachLead.create({
          data: {
            companyName: extracted.companyName,
            website: website ?? null,
            contactEmail: extracted.contactEmail ?? null,
            contactName: makerName,
            hiringFor: extracted.hiringFor ?? null,
            companyStage: "startup",
            source: "product_hunt",
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
        job: "scrape-product-hunt",
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
        job: "scrape-product-hunt",
        status: "error",
        message,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Product Hunt API types ───────────────────────────────────────────────────

interface PHPost {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  url: string;
  website?: string;
  makers?: { name: string; username: string; websiteUrl?: string }[];
}

interface PHResponse {
  data?: {
    posts?: {
      edges?: { node: PHPost }[];
    };
  };
}
