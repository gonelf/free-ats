import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { sendOutreachEmail } from "@/lib/outreach-mail";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

function ensureClaimToken(lead: { claimToken: string | null; claimTokenExpiresAt: Date | null }) {
  if (lead.claimToken && lead.claimTokenExpiresAt && lead.claimTokenExpiresAt > new Date()) {
    return lead.claimToken;
  }
  return randomBytes(32).toString("hex");
}

// POST /api/admin/outreach/[id]/send — send a cold email to this lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { subject, body } = await request.json();

  if (!subject || !body) {
    return NextResponse.json({ error: "subject and body are required" }, { status: 400 });
  }

  const lead = await db.outreachLead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.status === "unsubscribed") {
    return NextResponse.json({ error: "Lead has unsubscribed" }, { status: 400 });
  }
  if (!lead.contactEmail) {
    return NextResponse.json({ error: "Lead has no contact email" }, { status: 400 });
  }

  // Generate (or reuse) a claim token so the email can include a personalised /claim link
  const claimToken = ensureClaimToken(lead);
  const claimTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const claimUrl = `${APP_URL}/claim?token=${claimToken}`;

  await db.outreachLead.update({
    where: { id },
    data: { claimToken, claimTokenExpiresAt },
  });

  // Replace placeholder in body so the sender can include {{CLAIM_URL}} in the template
  const resolvedBody = body.replace(/\{\{CLAIM_URL\}\}/g, claimUrl);

  // Create the email record first (so we have an ID for tracking links)
  const emailRecord = await db.outreachEmail.create({
    data: { leadId: id, subject, body: resolvedBody },
  });

  // Send via Resend, injecting tracking pixel + click wrapper
  const result = await sendOutreachEmail({
    to: lead.contactEmail,
    subject,
    body: resolvedBody,
    emailId: emailRecord.id,
    leadId: id,
  });

  // Update email record with sent timestamp + Resend ID
  const updated = await db.outreachEmail.update({
    where: { id: emailRecord.id },
    data: {
      sentAt: new Date(),
      resendId: result?.resendId ?? null,
    },
  });

  // Mark lead as contacted
  await db.outreachLead.update({
    where: { id },
    data: {
      status: "contacted",
      lastContactedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
