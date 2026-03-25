import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@kitehr.co";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

interface SendOutreachEmailParams {
  to: string;
  subject: string;
  body: string; // plain HTML body (no tracking injected yet)
  emailId: string;
  leadId: string;
}

/**
 * Sends a cold outreach email with:
 * - Open tracking (1x1 pixel)
 * - Click tracking (CTA links wrapped via /api/track/click/[emailId])
 * - Unsubscribe footer
 */
export async function sendOutreachEmail({
  to,
  subject,
  body,
  emailId,
  leadId,
}: SendOutreachEmailParams): Promise<{ resendId: string | null }> {
  const trackingPixel = `<img src="${APP_URL}/api/track/open/${emailId}" width="1" height="1" style="display:none;" alt="" />`;
  const unsubscribeLink = `${APP_URL}/api/unsubscribe/${leadId}`;

  // Wrap any CTA links found in the body (href="https://app.kitehr.co/...")
  // so clicks route through the tracker then redirect to the original URL.
  // We specifically wrap links that point to kitehr.co.
  const trackedBody = body.replace(
    /href="(https?:\/\/(?:app\.)?kitehr\.co[^"]*)"/g,
    (_match, url) => {
      const tracked = `${APP_URL}/api/track/click/${emailId}?url=${encodeURIComponent(url)}`;
      return `href="${tracked}"`;
    }
  );

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">

      <div style="margin-bottom: 24px;">
        <span style="font-size: 22px; font-weight: 700; color: #6366f1;">KiteHR</span>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px;
                  box-shadow: 0 4px 6px -1px rgba(0,0,0,.07);">
        ${trackedBody}
      </div>

      <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.6;">
        <p style="margin: 0 0 4px;">
          You're receiving this because your company was hiring online.
        </p>
        <p style="margin: 0;">
          <a href="${unsubscribeLink}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>

      ${trackingPixel}
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.warn("Skipping outreach email: RESEND_API_KEY not set");
    return { resendId: null };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { resendId: data.data?.id ?? null };
  } catch (error) {
    console.error("Error sending outreach email:", error);
    throw error;
  }
}

/** Default cold email template for non-ATS leads */
export function buildColdEmailBody({
  companyName,
  jobTitle,
  claimUrl,
  jobUrl,
}: {
  companyName: string;
  jobTitle: string;
  claimUrl: string;
  jobUrl?: string;
}): string {
  return `
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      Hi ${companyName},
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      Saw you're hiring for <strong>${jobTitle}</strong> — we set up a free ATS workspace for you on KiteHR so you can start managing applications today.
    </p>
    ${jobUrl ? `<p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      Your job post is already live: <a href="${jobUrl}" style="color: #6366f1; text-decoration: none;">${jobUrl}</a>
    </p>` : ""}
    <div style="text-align: center; margin: 28px 0;">
      <a href="${claimUrl}"
         style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px;
                border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
        Claim your free workspace →
      </a>
    </div>
    <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
      It's free forever — unlimited users, jobs, and candidates. No credit card needed.
    </p>
    <p style="color: #6b7280; font-size: 14px; margin: 0;">— The KiteHR team</p>
  `;
}
