import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  await requireAdmin();

  const { toEmail, companyName, jobTitle, jobUrl } = await req.json();

  if (!toEmail || !jobTitle || !jobUrl) {
    return NextResponse.json(
      { error: "toEmail, jobTitle, and jobUrl are required" },
      { status: 400 }
    );
  }

  const subject = `Your "${jobTitle}" role is live on KiteHR — for free`;

  const body = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #1f2937;">
      Hi${companyName ? ` ${companyName}` : ""},
    </h2>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      We noticed you're hiring for a <strong>${jobTitle}</strong> role and wanted to help.
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      We've already set up a free ATS job page for you on KiteHR — no credit card needed,
      no complicated setup. Your job post is live and ready to collect applications right now:
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${jobUrl}"
         style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px;
                border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
        View your job on KiteHR →
      </a>
    </div>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      With KiteHR you can manage all incoming applications, move candidates through your pipeline,
      collaborate with your team, and use AI to speed up screening — all for free.
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      Simply <a href="https://kitehr.co/signup" style="color: #6366f1; text-decoration: none; font-weight: 600;">sign up</a>
      and claim your workspace to get started.
    </p>
    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      — The KiteHR team
    </p>
  `;

  await sendEmail({ to: toEmail, subject, body });

  return NextResponse.json({ success: true });
}
