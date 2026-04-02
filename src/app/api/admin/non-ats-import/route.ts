import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { extractJobFromText } from "@/lib/ai/job-extractor";

export const maxDuration = 60;

async function fetchUrlText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KiteHR-Bot/1.0; +https://kitehr.co)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Strip HTML tags to get readable text
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 20000); // Keep within reasonable AI prompt size
  } catch {
    return null;
  }
}

async function generateUniqueOrgSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let counter = 1;
  while (true) {
    const existing = await db.organization.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${slugify(base)}-${counter}`;
    counter++;
  }
}

export async function POST(req: NextRequest) {
  await requireAdmin();

  const { url, rawText } = await req.json();

  if (!url && !rawText) {
    return NextResponse.json(
      { error: "Provide a url or rawText" },
      { status: 400 }
    );
  }

  let text = rawText as string | undefined;

  if (url) {
    const fetched = await fetchUrlText(url as string);
    if (!fetched) {
      if (!rawText) {
        return NextResponse.json(
          { error: "fetch_failed" },
          { status: 422 }
        );
      }
      // Fall back to rawText if fetch failed
    } else {
      text = rawText ? `${fetched}\n\n${rawText}` : fetched;
    }
  }

  if (!text) {
    return NextResponse.json({ error: "No text to parse" }, { status: 400 });
  }

  const extracted = await extractJobFromText(text);

  const orgSlug = await generateUniqueOrgSlug(extracted.companyName);

  // Create the organization (unclaimed)
  const org = await db.organization.create({
    data: {
      name: extracted.companyName,
      slug: orgSlug,
      claimedStatus: "UNCLAIMED",
      aiCreditsBalance: 0,
    },
  });

  // Create default pipeline with stages
  const pipeline = await db.pipeline.create({
    data: {
      organizationId: org.id,
      name: "Default",
      isDefault: true,
      stages: {
        create: [
          { name: "Applied", order: 0, color: "#6366f1" },
          { name: "Review", order: 1, color: "#f59e0b" },
          { name: "Interview", order: 2, color: "#3b82f6" },
          { name: "Offer", order: 3, color: "#10b981" },
        ],
      },
    },
  });

  // Generate unique job slug within org
  const jobSlugBase = slugify(extracted.title);
  const job = await db.job.create({
    data: {
      organizationId: org.id,
      pipelineId: pipeline.id,
      title: extracted.title,
      description: extracted.description,
      requirements: extracted.requirements || "",
      location: extracted.location,
      salaryMin: extracted.salaryMin,
      salaryMax: extracted.salaryMax,
      slug: jobSlugBase,
      status: "OPEN",
      extraDetails: extracted.extraDetails || null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kitehr.co";
  const jobUrl = `${appUrl}/${orgSlug}/jobs/${job.slug}`;

  return NextResponse.json({
    orgId: org.id,
    orgSlug,
    jobId: job.id,
    jobSlug: job.slug,
    jobUrl,
    companyName: extracted.companyName,
    jobTitle: extracted.title,
    extractedEmail: extracted.contactEmail,
  });
}
