import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateJSON } from "@/lib/ai/gemini";
import { flashModel } from "@/lib/ai/gemini";

interface ContactResult {
  contactEmail: string | null;
  contactName: string | null;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

/**
 * Attempt to find a contact email for a company by:
 * 1. Fetching their website and extracting emails via regex
 * 2. Falling back to Gemini to infer likely contact patterns
 */
async function findContactFromWebsite(website: string, companyName: string): Promise<ContactResult> {
  let pageText = "";

  // Try fetching the website
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KiteHR/1.0)" },
    });
    if (res.ok) {
      const html = await res.text();
      // Strip tags and trim
      pageText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 8000);
    }
  } catch {
    // Can't reach site — fall through to AI-only approach
  }

  // Extract emails from page text via regex
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const rawEmails = pageText.match(emailRegex) ?? [];

  // Filter out common no-reply / image / placeholder emails
  const noisePatterns = /noreply|no-reply|example\.|\.png|\.jpg|\.gif|sentry|privacy@|abuse@|security@/i;
  const emails = [...new Set(rawEmails.filter((e) => !noisePatterns.test(e)))];

  if (emails.length > 0) {
    // Pick the most likely hiring/contact email
    const hiringEmail = emails.find((e) => /hire|job|career|recruit|talent|hr@|people@/i.test(e));
    const contactEmail = emails.find((e) => /contact|info|hello|team@/i.test(e));
    const chosen = hiringEmail ?? contactEmail ?? emails[0];

    return { contactEmail: chosen, contactName: null, confidence: "high", reasoning: "Extracted from website" };
  }

  // Fall back to Gemini
  const prompt = `You are a B2B lead researcher. Given the company name and website below, suggest the most likely contact email address for their hiring or general contact.

Company: ${companyName}
Website: ${website}
${pageText ? `Page content snippet: ${pageText.slice(0, 2000)}` : ""}

Return JSON only:
{
  "contactEmail": "...",    // best guess email, or null if truly unknown
  "contactName": "...",     // contact name if inferable, otherwise null
  "confidence": "high|medium|low",
  "reasoning": "..."        // brief explanation
}`;

  const result = await generateJSON<ContactResult>(flashModel, prompt);
  return result;
}

// POST /api/admin/outreach/find-contacts
// Body: { leadId?: string } — if omitted, processes ALL leads without a contact email
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return new Response("Forbidden", { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { leadId, source, stage } = body as { leadId?: string; source?: string; stage?: string };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const where = leadId
          ? { id: leadId }
          : {
              contactEmail: null,
              website: { not: null },
              ...(source && source !== "all" ? { source } : {}),
              ...(stage && stage !== "all" ? { companyStage: stage } : {}),
            };

        const leads = await db.outreachLead.findMany({
          where,
          orderBy: { createdAt: "asc" },
        });

        enqueue({ type: "start", total: leads.length });

        let found = 0;
        let notFound = 0;

        for (const lead of leads) {
          if (!lead.website) {
            notFound++;
            enqueue({ type: "progress", found, notFound, total: leads.length, company: lead.companyName, result: null });
            continue;
          }

          try {
            const result = await findContactFromWebsite(lead.website, lead.companyName);

            if (result.contactEmail) {
              await db.outreachLead.update({
                where: { id: lead.id },
                data: {
                  contactEmail: result.contactEmail,
                  contactName: result.contactName ?? lead.contactName,
                },
              });
              found++;
            } else {
              notFound++;
            }

            enqueue({
              type: "progress",
              found,
              notFound,
              total: leads.length,
              company: lead.companyName,
              result,
            });
          } catch (err) {
            notFound++;
            enqueue({
              type: "progress",
              found,
              notFound,
              total: leads.length,
              company: lead.companyName,
              error: err instanceof Error ? err.message : "Unknown error",
            });
          }

          // Throttle
          await new Promise((r) => setTimeout(r, 300));
        }

        enqueue({ type: "done", found, notFound, total: leads.length });
      } catch (err) {
        enqueue({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
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
