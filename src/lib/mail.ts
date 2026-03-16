import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@kitehr.xyz";

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
          Powered by <a href="https://kitehr.xyz" style="color: #6366f1; text-decoration: none; font-weight: 600;">KiteHR</a>
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
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
