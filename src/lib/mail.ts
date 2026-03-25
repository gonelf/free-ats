import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@kitehr.co";

export async function sendWelcomeEmail({
  to,
  name,
  orgName,
}: {
  to: string;
  name: string;
  orgName: string;
}) {
  const body = `
    <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 16px;">Welcome to KiteHR, ${name}!</h1>
    <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 16px;">
      Your workspace for <strong>${orgName}</strong> is ready. Here's what you can do to get started:
    </p>
    <ul style="font-size: 16px; line-height: 28px; color: #4b5563; margin: 0 0 24px; padding-left: 20px;">
      <li>Post your first job opening</li>
      <li>Add candidates and track them through your pipeline</li>
      <li>Invite your team members to collaborate</li>
      <li>Use AI to score and summarize resumes</li>
    </ul>
    <a href="https://app.kitehr.co/jobs" style="display: inline-block; background: #6366f1; color: white; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin-bottom: 24px;">Go to your dashboard →</a>
    <p style="font-size: 14px; line-height: 22px; color: #6b7280; margin: 0;">
      If you have any questions, just reply to this email — we're happy to help.
    </p>
  `;

  return sendEmail({ to, subject: `Welcome to KiteHR, ${name}!`, body });
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string; // HTML body
}

export async function sendEmail({ to, subject, body }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Skipping email send: RESEND_API_KEY is not defined");
    return;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <div style="margin-bottom: 32px; text-align: center;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #6366f1; border-radius: 12px; margin-bottom: 16px;">
          <span style="color: white; font-size: 24px;">📋</span>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        ${body}
      </div>

      <div style="margin-top: 32px; text-align: center; border-top: 1px solid #f3f4f6; pt: 24px;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          Powered by <a href="https://kitehr.co" style="color: #6366f1; text-decoration: none; font-weight: 600;">KiteHR</a>
        </p>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { resendId: data.data?.id ?? null };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
