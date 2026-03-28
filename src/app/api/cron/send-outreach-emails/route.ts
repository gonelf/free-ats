/**
 * Cron: Send Outreach Emails
 *
 * Runs daily at 15:00 UTC — one hour after the last daily scraper (TechCrunch
 * at 14:00) — so every freshly-scraped lead with an email address is contacted
 * the same day it was found.
 *
 * Hobby-plan constraints:
 *   - maxDuration = 60s
 *   - BATCH_SIZE = 60 → 60 × 500 ms delay = 30 s + DB overhead ≈ 40 s total
 *   - 60 emails/day keeps well within Resend's free-tier 100 emails/day limit,
 *     leaving headroom for transactional emails (welcome, invites, etc.)
 *
 * Eligibility criteria for a lead to be emailed:
 *   - status = "new"
 *   - contactEmail is set (not null)
 *   - no OutreachEmail record exists yet (prevents duplicates across re-runs)
 *
 * Secured by CRON_SECRET (same pattern as every other cron in this project).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOutreachEmail } from "@/lib/outreach-mail";
import {
  buildOutreachEmailBody,
  DEFAULT_OUTREACH_SUBJECT,
} from "@/lib/outreach-email-template";
import { randomBytes } from "crypto";

export const maxDuration = 60;

const BATCH_SIZE = 60;
const EMAIL_DELAY_MS = 500; // ~2 emails/s — respects Resend rate limits
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  async function saveLog(
    status: "success" | "skipped" | "error",
    message: string,
    details?: object
  ) {
    await db.cronLog.create({
      data: {
        job: "send-outreach-emails",
        status,
        message,
        details: details ?? {},
        durationMs: Date.now() - startedAt,
      },
    });
  }

  // Only email leads that have never received an outreach email before.
  // The `emails: { none: {} }` filter prevents re-sending if the cron somehow
  // runs twice or a lead was left as "new" after a partial failure.
  const leads = await db.outreachLead.findMany({
    where: {
      status: "new",
      contactEmail: { not: null },
      emails: { none: {} },
    },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
  });

  if (leads.length === 0) {
    await saveLog("skipped", "No new leads with email addresses to contact");
    return NextResponse.json({ message: "No new leads to contact" });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const lead of leads) {
    // Generate (or reuse) a valid claim token
    let claimToken = lead.claimToken;
    const tokenValid =
      claimToken &&
      lead.claimTokenExpiresAt &&
      lead.claimTokenExpiresAt > new Date();

    if (!tokenValid) {
      claimToken = randomBytes(32).toString("hex");
      await db.outreachLead.update({
        where: { id: lead.id },
        data: {
          claimToken,
          claimTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const claimUrl = `${APP_URL}/claim?token=${claimToken}`;
    const subject = DEFAULT_OUTREACH_SUBJECT(lead.companyName);
    const body = buildOutreachEmailBody({
      companyName: lead.companyName,
      hiringFor: lead.hiringFor,
      claimUrl,
    });

    // Create the record first so the tracking pixel/links have a valid emailId
    const emailRecord = await db.outreachEmail.create({
      data: { leadId: lead.id, subject, body },
    });

    try {
      const result = await sendOutreachEmail({
        to: lead.contactEmail!,
        subject,
        body,
        emailId: emailRecord.id,
        leadId: lead.id,
      });

      await db.outreachEmail.update({
        where: { id: emailRecord.id },
        data: { sentAt: new Date(), resendId: result.resendId ?? null },
      });

      await db.outreachLead.update({
        where: { id: lead.id },
        data: { status: "contacted", lastContactedAt: new Date() },
      });

      sent++;
    } catch (err) {
      // Clean up the dangling record so the lead stays eligible next run
      await db.outreachEmail.delete({ where: { id: emailRecord.id } }).catch(() => {});
      failed++;
      errors.push(
        `${lead.companyName}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }

    // Throttle to respect Resend sending limits
    await new Promise((r) => setTimeout(r, EMAIL_DELAY_MS));
  }

  const status = sent === 0 && failed > 0 ? "error" : "success";
  await saveLog(
    status,
    `Sent ${sent}/${leads.length} outreach emails (${failed} failed)`,
    { sent, failed, errors: errors.slice(0, 20) }
  );

  return NextResponse.json({ sent, failed, total: leads.length });
}
