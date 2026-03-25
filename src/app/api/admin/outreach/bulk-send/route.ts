import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { sendOutreachEmail, buildOutreachEmailBody } from "@/lib/outreach-mail";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

const DEFAULT_SUBJECT = (companyName: string) =>
  `${companyName} — your free ATS workspace is ready`;

function send(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
}

// POST /api/admin/outreach/bulk-send — streams SSE progress while sending to all new leads with an email
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response("Forbidden", { status: 403 });
  }

  // Optional: accept status filter from body (defaults to "new")
  let statusFilter: string[] = ["new"];
  try {
    const body = await request.json();
    if (Array.isArray(body?.statuses)) statusFilter = body.statuses;
  } catch {
    // body may be empty — that's fine
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        // Fetch all eligible leads
        const leads = await db.outreachLead.findMany({
          where: {
            status: { in: statusFilter },
            contactEmail: { not: null },
          },
          orderBy: { createdAt: "asc" },
        });

        enqueue({ type: "start", total: leads.length });

        let sent = 0;
        let skipped = 0;
        let failed = 0;

        for (const lead of leads) {
          // Generate (or reuse) claim token
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
          const subject = DEFAULT_SUBJECT(lead.companyName);
          const body = buildOutreachEmailBody({
            companyName: lead.companyName,
            hiringFor: lead.hiringFor,
            claimUrl,
          });

          // Create email record
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
            enqueue({ type: "progress", sent, skipped, failed, total: leads.length, company: lead.companyName });
          } catch (err) {
            // Delete the unsent email record to keep data clean
            await db.outreachEmail.delete({ where: { id: emailRecord.id } }).catch(() => {});
            failed++;
            enqueue({
              type: "progress",
              sent,
              skipped,
              failed,
              total: leads.length,
              company: lead.companyName,
              error: err instanceof Error ? err.message : "Unknown error",
            });
          }

          // Throttle: ~2 emails/second to stay within Resend limits
          await new Promise((r) => setTimeout(r, 500));
        }

        enqueue({ type: "done", sent, skipped, failed, total: leads.length });
      } catch (err) {
        send(controller, { type: "error", message: err instanceof Error ? err.message : "Unknown error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
