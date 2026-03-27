import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join } from "path";

export const maxDuration = 300;

const SOPS_PER_RUN = 5;
const BATCH_DELAY_MS = 2000;

interface SopPlanEntry {
  slug: string;
  title: string;
  category: string;
  phase: number;
}

interface GeneratedSopContent {
  metaTitle: string;
  metaDescription: string;
  description: string;
  purpose: string;
  scope: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    tips?: string[];
  }>;
  responsibleRoles: string[];
  frequency: string;
  estimatedTime: string;
  relatedSlugs: string[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse SOP_CONTENT_PLAN.md and return all entries for a given phase (or all phases).
 * Each SOP entry looks like:
 *   ### SOP N
 *   **Slug:** some-slug
 *   **Title:** Some Title
 *   **Category:** hiring
 *   **Phase:** 2
 */
function parseSopPlan(phase?: number): SopPlanEntry[] {
  const planPath = join(process.cwd(), "SOP_CONTENT_PLAN.md");
  const content = readFileSync(planPath, "utf-8");

  const entries: SopPlanEntry[] = [];
  // Match each ### SOP block
  const blocks = content.split(/^### SOP \d+/m).slice(1);

  for (const block of blocks) {
    const slugMatch = block.match(/\*\*Slug:\*\*\s*(.+)/);
    const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/);
    const categoryMatch = block.match(/\*\*Category:\*\*\s*(.+)/);
    const phaseMatch = block.match(/\*\*Phase:\*\*\s*(\d+)/);

    if (!slugMatch || !titleMatch || !categoryMatch || !phaseMatch) continue;

    const entryPhase = parseInt(phaseMatch[1]);
    if (phase !== undefined && entryPhase !== phase) continue;

    entries.push({
      slug: slugMatch[1].trim(),
      title: titleMatch[1].trim(),
      category: categoryMatch[1].trim(),
      phase: entryPhase,
    });
  }

  return entries;
}

async function generateSopContent(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>,
  sop: SopPlanEntry
): Promise<GeneratedSopContent> {
  const prompt = `You are an HR operations expert writing a Standard Operating Procedure (SOP) for KiteHR, a free applicant tracking system.

Write a complete, practical SOP for: "${sop.title}"
Category: ${sop.category}

Return a JSON object with this exact structure:

{
  "metaTitle": "SEO title 50-60 chars, include 'SOP' and the topic",
  "metaDescription": "Meta description 150-160 chars. Include primary keyword. Mention it's free.",
  "description": "2-3 sentence overview of what this SOP covers and why it matters",
  "purpose": "1-2 sentences explaining the purpose and business objective of this SOP",
  "scope": "1-2 sentences defining who this SOP applies to and what it covers",
  "steps": [
    {
      "step": 1,
      "title": "Step title (action verb + noun)",
      "description": "Clear, actionable description of this step. 2-4 sentences. Include specific actions, tools, or criteria.",
      "tips": ["Practical tip 1", "Practical tip 2"]
    }
  ],
  "responsibleRoles": ["HR Manager", "Recruiter"],
  "frequency": "Per hire | Annually | As needed | Monthly | Weekly",
  "estimatedTime": "e.g. 30 minutes | 2 hours | 1 day",
  "relatedSlugs": ["related-sop-slug-1", "related-sop-slug-2"]
}

Guidelines:
- Write 6-10 clear, numbered steps. Each step should be concrete and actionable.
- Include 2-3 practical tips per step where relevant (not every step needs tips).
- responsibleRoles: 2-4 job titles who are involved.
- relatedSlugs: 2-4 slugs of related SOPs from this list (use only real slugs):
  resume-screening-sop, phone-screen-sop, technical-interview-sop, reference-check-sop,
  offer-letter-sop, background-check-sop, job-posting-approval-sop, hiring-decision-sop,
  candidate-rejection-sop, onboarding-handoff-sop, remote-hiring-sop, executive-hiring-sop,
  diversity-hiring-sop, internship-program-sop, employee-referral-sop,
  employee-onboarding-sop, employee-offboarding-sop, performance-review-sop,
  promotion-process-sop, termination-sop, leave-of-absence-sop, harassment-complaint-sop,
  salary-review-sop, employee-warning-sop, pip-sop,
  i9-verification-sop, fmla-leave-sop, ada-accommodations-sop, data-privacy-sop,
  workplace-investigation-sop
- Voice: practical, direct, no jargon. Write like a knowledgeable HR colleague.
- Mention KiteHR naturally in 1 step where it genuinely helps (e.g. tracking candidates, managing pipeline).

Respond with valid JSON only, no markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text;
  return JSON.parse(jsonStr) as GeneratedSopContent;
}

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phaseParam = searchParams.get("phase");
  const dryRun = searchParams.get("dryRun") === "true";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : SOPS_PER_RUN;

  const phase = phaseParam && phaseParam !== "all" ? parseInt(phaseParam) : undefined;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(msg: string) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ msg })}\n\n`));
      }

      try {
        // Parse plan
        const allEntries = parseSopPlan(phase);
        send(`Mode: ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
        send(`Phase filter: ${phase ?? "all"} | Entries in plan: ${allEntries.length}`);

        if (allEntries.length === 0) {
          send("No entries found for the selected phase.");
          controller.enqueue(
            encoder.encode(`event: done\ndata: ${JSON.stringify({ totalUpserted: 0, totalInDb: 0 })}\n\n`)
          );
          controller.close();
          return;
        }

        // Find already-generated slugs
        const existing = await db.generatedSop.findMany({ select: { slug: true } });
        const existingSlugs = new Set(existing.map((e) => e.slug));
        send(`Already in DB: ${existingSlugs.size} SOPs`);

        const toGenerate = allEntries.filter((e) => !existingSlugs.has(e.slug)).slice(0, limit);
        send(`To generate this run: ${toGenerate.length} SOPs\n`);

        if (toGenerate.length === 0) {
          send("✅ All SOPs for this phase are already in the database.");
          controller.enqueue(
            encoder.encode(`event: done\ndata: ${JSON.stringify({ totalUpserted: 0, totalInDb: existing.length })}\n\n`)
          );
          controller.close();
          return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let totalUpserted = 0;

        for (let i = 0; i < toGenerate.length; i++) {
          const sop = toGenerate[i];
          send(`--- [${i + 1}/${toGenerate.length}] ${sop.title} (Phase ${sop.phase}) ---`);

          let content: GeneratedSopContent;
          try {
            send(`  Calling Gemini...`);
            content = await generateSopContent(model, sop);
          } catch (err) {
            send(`  ✗ Gemini error: ${String(err)}. Retrying in 5s...`);
            await sleep(5000);
            try {
              content = await generateSopContent(model, sop);
            } catch {
              send(`  ✗ Retry failed — skipping ${sop.slug}`);
              continue;
            }
          }

          if (dryRun) {
            send(`  [DRY RUN] Would insert: "${content.metaTitle}"`);
            send(`  Steps: ${content.steps.length} | Roles: ${content.responsibleRoles.join(", ")}`);
          } else {
            await db.generatedSop.upsert({
              where: { slug: sop.slug },
              create: {
                slug: sop.slug,
                title: sop.title,
                category: sop.category,
                phase: sop.phase,
                metaTitle: content.metaTitle,
                metaDescription: content.metaDescription,
                description: content.description,
                purpose: content.purpose,
                scope: content.scope,
                steps: content.steps,
                responsibleRoles: content.responsibleRoles,
                frequency: content.frequency,
                estimatedTime: content.estimatedTime,
                relatedSlugs: content.relatedSlugs,
                publishedAt: null,
              },
              update: {
                metaTitle: content.metaTitle,
                metaDescription: content.metaDescription,
                description: content.description,
                purpose: content.purpose,
                scope: content.scope,
                steps: content.steps,
                responsibleRoles: content.responsibleRoles,
                frequency: content.frequency,
                estimatedTime: content.estimatedTime,
                relatedSlugs: content.relatedSlugs,
              },
            });
            totalUpserted++;
            send(`  ✓ Saved to DB (publishedAt: null — awaiting cron publish)`);
          }

          if (i < toGenerate.length - 1) {
            await sleep(BATCH_DELAY_MS);
          }
        }

        const totalInDb = dryRun ? null : await db.generatedSop.count();
        send(
          `\n✅ Done! ${dryRun ? "Dry run complete." : `Upserted ${totalUpserted} SOPs.`}${totalInDb !== null ? ` Total in DB: ${totalInDb}` : ""}`
        );
        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({ totalUpserted, totalInDb })}\n\n`
          )
        );
      } catch (err) {
        send(`\n✗ Fatal error: ${String(err)}`);
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`)
        );
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
