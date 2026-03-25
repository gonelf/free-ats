import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { sendOutreachEmail } from "@/lib/outreach-mail";

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

  // Create the email record first (so we have an ID for tracking links)
  const emailRecord = await db.outreachEmail.create({
    data: { leadId: id, subject, body },
  });

  // Send via Resend, injecting tracking pixel + click wrapper
  const result = await sendOutreachEmail({
    to: lead.contactEmail,
    subject,
    body,
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
