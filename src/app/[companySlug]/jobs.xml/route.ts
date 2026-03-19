import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";
import { generateIndeedFeed } from "@/lib/distribution/indeed-feed";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  if (!(await isFlagEnabled(FLAGS.JOB_DISTRIBUTION))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { companySlug } = await params;

  const org = await db.organization.findUnique({
    where: { slug: companySlug },
    select: { id: true },
  });

  if (!org) return new NextResponse("Not found", { status: 404 });

  // Record Indeed feed integration if not already present
  await db.integration.upsert({
    where: { organizationId_platform: { organizationId: org.id, platform: "indeed_feed" } },
    create: { organizationId: org.id, platform: "indeed_feed", enabled: true },
    update: {},
  });

  const xml = await generateIndeedFeed(org.id);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
