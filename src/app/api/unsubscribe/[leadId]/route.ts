import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/unsubscribe/[leadId] — one-click unsubscribe, shows confirmation page
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  await db.outreachLead.updateMany({
    where: { id: leadId },
    data: { status: "unsubscribed" },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — KiteHR</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #111827; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 40px 48px; max-width: 420px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,.07); }
    h1 { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
    p { font-size: 15px; color: #6b7280; margin: 0 0 24px; line-height: 1.6; }
    a { color: #6366f1; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px; margin-bottom: 16px;">✓</div>
    <h1>You've been unsubscribed</h1>
    <p>You won't receive any more emails from KiteHR outreach. We're sorry to see you go.</p>
    <a href="https://kitehr.co">Visit KiteHR →</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
