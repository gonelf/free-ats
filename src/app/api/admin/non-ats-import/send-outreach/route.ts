import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/mail";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

function generateClaimToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  await requireAdmin();

  const { toEmail, companyName, jobTitle, jobUrl, orgId } = await req.json();

  if (!toEmail || !jobTitle || !jobUrl) {
    return NextResponse.json(
      { error: "toEmail, jobTitle, and jobUrl are required" },
      { status: 400 }
    );
  }

  // Generate a claim token and attach it to the org (if orgId provided)
  let claimUrl = `${APP_URL}/signup`;
  if (orgId) {
    const token = generateClaimToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.organization.update({
      where: { id: orgId },
      data: { claimToken: token, claimTokenExpiresAt: expiresAt },
    });

    claimUrl = `${APP_URL}/claim?token=${token}`;
  }

  const subject = `Your "${jobTitle}" role is live on KiteHR — for free`;

  const body = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #1f2937;">
      Hi${companyName ? ` ${companyName}` : ""},
    </h2>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      We noticed you're hiring for a <strong>${jobTitle}</strong> role and set up a free hiring workspace for you on KiteHR — no credit card, no complicated setup.
    </p>
    <p style="margin: 0 0 8px; color: #4b5563; line-height: 1.6;">
      Your job post is already live and ready to collect applications:
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${jobUrl}" style="color: #6366f1; text-decoration: none; font-weight: 500;">${jobUrl}</a>
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${claimUrl}"
         style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px;
                border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
        Claim your free workspace →
      </a>
    </div>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      Once you claim it, you can manage applications, move candidates through a pipeline, invite your team, and use AI to speed up screening — all free, forever.
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      No per-seat pricing, no hidden fees. Unlimited users, jobs, and candidates.
    </p>
    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      — The KiteHR team
    </p>
  `;

  await sendEmail({ to: toEmail, subject, body });

  return NextResponse.json({ success: true, claimUrl });
}
