/**
 * Pure template helpers — no server-only imports, safe to use in both
 * server code and "use client" components.
 */

export interface OutreachEmailBodyParams {
  companyName: string;
  hiringFor?: string | null;
  claimUrl: string;
}

export function buildOutreachEmailBody({
  companyName,
  hiringFor,
  claimUrl,
}: OutreachEmailBodyParams): string {
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

export const DEFAULT_OUTREACH_SUBJECT = (companyName: string) =>
  `${companyName} — your free ATS workspace is ready`;
