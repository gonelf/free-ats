import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
// RESEND_FROM_EMAIL can include a display name, e.g. "Alex from KiteHR <alex@kitehr.co>"
const fromEmail = process.env.RESEND_FROM_EMAIL || "The KiteHR Team <hello@kitehr.co>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

interface SendOutreachEmailParams {
  to: string;
  subject: string;
  body: string; // inner HTML body (no wrapper/tracking yet)
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

  // Detect plain-text bodies (no HTML tags) and convert newlines to paragraphs
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const normalizedBody = isHtml
    ? body
    : body
        .split(/\n\n+/)
        .map((para) => `<p style="margin:0 0 16px;color:#374151;line-height:1.7;">${para.replace(/\n/g, "<br/>")}</p>`)
        .join("");

  // Wrap kit links for click tracking
  const trackedBody = normalizedBody.replace(
    /href="(https?:\/\/(?:app\.)?kitehr\.co[^"]*)"/g,
    (_match, url) => {
      const tracked = `${APP_URL}/api/track/click/${emailId}?url=${encodeURIComponent(url)}`;
      return `href="${tracked}"`;
    }
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:580px;background:#ffffff;border-radius:20px;
                      box-shadow:0 4px 24px rgba(0,0,0,0.07);overflow:hidden;">

          <!-- Logo header -->
          <tr>
            <td style="padding:28px 36px 24px;border-bottom:1px solid #f3f4f6;">
              <a href="${APP_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
                <img src="${APP_URL}/logo.png" alt="KiteHR" width="36" height="36"
                     style="border-radius:9px;display:block;" />
                <span style="font-size:20px;font-weight:700;color:#4f46e5;letter-spacing:-0.3px;">KiteHR</span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              ${trackedBody}
            </td>
          </tr>

          <!-- Footer strip -->
          <tr>
            <td style="padding:20px 36px;background:#f9fafb;border-top:1px solid #f3f4f6;
                       text-align:center;font-size:12px;color:#9ca3af;line-height:1.6;">
              You&rsquo;re receiving this because your company was hiring online.&nbsp;&nbsp;
              <a href="${unsubscribeLink}"
                 style="color:#9ca3af;text-decoration:underline;white-space:nowrap;">Unsubscribe</a>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

  ${trackingPixel}
</body>
</html>`;

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

/**
 * Beautiful HTML body for cold outreach to companies without an ATS.
 * Used by bulk-send, individual send default, and test sandbox.
 */
export function buildOutreachEmailBody({
  companyName,
  hiringFor,
  claimUrl,
}: {
  companyName: string;
  hiringFor?: string | null;
  claimUrl: string;
}): string {
  const role = hiringFor?.split(",")[0]?.trim() ?? "your open roles";

  return `
    <!-- Greeting -->
    <p style="margin:0 0 20px;font-size:16px;color:#111827;line-height:1.6;">
      Hi <strong>${companyName}</strong>,
    </p>

    <!-- Hook -->
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Saw you&rsquo;re hiring for <strong>${role}</strong>. We built KiteHR — a completely
      free ATS — and set up a workspace for you so you can start managing applications today,
      without the usual setup headache.
    </p>

    <!-- Feature bullets -->
    <table cellpadding="0" cellspacing="0" role="presentation"
           style="width:100%;margin:0 0 28px;background:#f5f3ff;border-radius:14px;padding:20px 24px;">
      <tr>
        <td>
          ${[
            ["📋", "Unlimited jobs, candidates &amp; users"],
            ["⚡", "Kanban pipeline + AI-assisted screening"],
            ["🔒", "Free forever — no credit card, no trial"],
          ]
            .map(
              ([icon, text]) => `
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
            <span style="font-size:17px;line-height:1.4;">${icon}</span>
            <span style="font-size:14px;color:#3730a3;font-weight:500;line-height:1.5;">${text}</span>
          </div>`
            )
            .join("")}
        </td>
      </tr>
    </table>

    <!-- CTA button -->
    <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin:0 0 28px;">
      <tr>
        <td align="center">
          <a href="${claimUrl}"
             style="display:inline-block;background:#4f46e5;color:#ffffff;
                    padding:16px 40px;border-radius:12px;font-size:16px;
                    font-weight:700;text-decoration:none;letter-spacing:-0.2px;
                    box-shadow:0 4px 14px rgba(79,70,229,0.35);">
            Claim your free workspace &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Social proof / objection handling -->
    <p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.7;text-align:center;">
      Most teams switch from spreadsheets to KiteHR in under 10 minutes.<br/>
      No per-seat pricing. No hidden fees.
    </p>

    <!-- Sign-off -->
    <p style="margin:24px 0 0;font-size:14px;color:#9ca3af;">
      &mdash; The KiteHR team
    </p>

    <!-- P.S. joke -->
    <p style="margin:16px 0 0;font-size:13px;color:#d1d5db;line-height:1.6;border-top:1px solid #f3f4f6;padding-top:16px;">
      <em>P.S. Yes, this email was sent by a robot. We&rsquo;re a tiny team, so we automate
      everything we possibly can &mdash; which is exactly why we built KiteHR.
      We figured if automation is good enough for our outreach, it&rsquo;s good enough for your hiring too. 🤖</em>
    </p>
  `;
}

/** Default cold email template for non-ATS leads (non-ats-import flow) */
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
  return buildOutreachEmailBody({ companyName, hiringFor: jobTitle, claimUrl }) +
    (jobUrl
      ? `<p style="margin:12px 0 0;font-size:13px;color:#6b7280;">
           Your job post: <a href="${jobUrl}" style="color:#4f46e5;text-decoration:none;">${jobUrl}</a>
         </p>`
      : "");
}
