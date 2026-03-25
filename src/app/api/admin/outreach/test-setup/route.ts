/**
 * POST /api/admin/outreach/test-setup
 *
 * Creates (or resets) a test outreach lead + unclaimed organisation so the
 * /claim email flow can be tested end-to-end without touching real data.
 *
 * Fixed identifiers (so reset always works):
 *   Org slug : "_test-outreach_"
 *   Lead email: "gonelf@gmail.com"
 */
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

const TEST_ORG_SLUG = "_test-outreach_";
const TEST_EMAIL = "gonelf@gmail.com";
const TEST_COMPANY = "Acme Corp (test)";
const JOB_SLUG = "senior-engineer-test";

function newToken() {
  return randomBytes(32).toString("hex");
}

function newExpiry() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
}

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const claimToken = newToken();
  const claimTokenExpiresAt = newExpiry();

  /* ── 1. Upsert Organisation ── */
  let org = await db.organization.findUnique({ where: { slug: TEST_ORG_SLUG } });

  if (!org) {
    /* First-time setup: create org + pipeline + job */
    org = await db.organization.create({
      data: {
        name: TEST_COMPANY,
        slug: TEST_ORG_SLUG,
        claimedStatus: "UNCLAIMED",
        claimToken,
        claimTokenExpiresAt,
      },
    });

    const pipeline = await db.pipeline.create({
      data: {
        organizationId: org.id,
        name: "Hiring",
        isDefault: true,
        stages: {
          createMany: {
            data: [
              { name: "Applied", order: 0 },
              { name: "Interview", order: 1 },
              { name: "Offer", order: 2 },
            ],
          },
        },
      },
    });

    await db.job.create({
      data: {
        organizationId: org.id,
        pipelineId: pipeline.id,
        title: "Senior Software Engineer",
        description:
          "We are looking for a Senior Software Engineer to join our team and help build the future of Acme Corp.",
        requirements: "5+ years of experience with TypeScript, React, and Node.js.",
        location: "Remote",
        status: "OPEN",
        slug: JOB_SLUG,
      },
    });
  } else {
    /* Reset: wipe members, restore claim token & UNCLAIMED status */
    await db.member.deleteMany({ where: { organizationId: org.id } });

    org = await db.organization.update({
      where: { id: org.id },
      data: {
        claimedStatus: "UNCLAIMED",
        claimToken,
        claimTokenExpiresAt,
      },
    });
  }

  /* ── 2. Upsert OutreachLead ── */
  let lead = await db.outreachLead.findFirst({ where: { contactEmail: TEST_EMAIL } });

  if (!lead) {
    lead = await db.outreachLead.create({
      data: {
        companyName: TEST_COMPANY,
        website: "https://acme.example.com",
        contactEmail: TEST_EMAIL,
        contactName: "Gonelf (test)",
        source: "manual",
        hiringFor: "Senior Software Engineer",
        status: "new",
        claimToken,
        claimTokenExpiresAt,
      },
    });
  } else {
    /* Reset: delete emails, restore status + fresh claim token */
    await db.outreachEmail.deleteMany({ where: { leadId: lead.id } });

    lead = await db.outreachLead.update({
      where: { id: lead.id },
      data: {
        status: "new",
        lastContactedAt: null,
        claimToken,
        claimTokenExpiresAt,
      },
    });
  }

  // Keep claim tokens in sync (lead token == org token so /claim shows full page)
  await db.organization.update({
    where: { id: org.id },
    data: { claimToken, claimTokenExpiresAt },
  });
  await db.outreachLead.update({
    where: { id: lead.id },
    data: { claimToken, claimTokenExpiresAt },
  });

  const claimUrl = `${APP_URL}/claim?token=${claimToken}`;

  return NextResponse.json({
    lead: {
      id: lead.id,
      status: lead.status,
      contactEmail: lead.contactEmail,
    },
    org: {
      id: org.id,
      slug: org.slug,
      claimedStatus: org.claimedStatus,
    },
    claimUrl,
  });
}
