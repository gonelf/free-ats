import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON } from "@/lib/ai/gemini";
import { proModel } from "@/lib/ai/gemini";
import { readFileSync } from "fs";
import { join } from "path";
import type { BlogSection } from "@/app/blog/posts";

const TOTAL_PLAN_DAYS = 30;

function extractDayBrief(planContent: string, day: number): string {
  const dayHeader = `## Day ${day}\n`;
  const nextDayHeader = `## Day ${day + 1}\n`;
  const start = planContent.indexOf(dayHeader);
  if (start === -1) throw new Error(`Day ${day} not found in plan`);
  const end = day < TOTAL_PLAN_DAYS ? planContent.indexOf(nextDayHeader, start) : planContent.length;
  return planContent.slice(start, end === -1 ? planContent.length : end).trim();
}

interface GeneratedPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  content: BlogSection[];
}

/**
 * Daily cron that generates the next blog post from SEO_BLOG_PLAN.md using AI
 * and stores it in the database. Runs one day at a time in order (Day 1 → 30).
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine which day to generate next by finding the first unpublished day
  const publishedPosts = await db.generatedBlogPost.findMany({
    select: { planDay: true },
  });
  const publishedDays = new Set(publishedPosts.map((p) => p.planDay));

  let nextDay: number | null = null;
  for (let day = 1; day <= TOTAL_PLAN_DAYS; day++) {
    if (!publishedDays.has(day)) {
      nextDay = day;
      break;
    }
  }

  if (nextDay === null) {
    await db.cronLog.create({
      data: {
        job: "generate-blog-post",
        status: "skipped",
        message: `All ${TOTAL_PLAN_DAYS} blog posts have been generated`,
        durationMs: Date.now() - startedAt,
      },
    });
    return NextResponse.json({ skipped: true, reason: "All 30 posts generated" });
  }

  // Read the plan
  const planPath = join(process.cwd(), "SEO_BLOG_PLAN.md");
  const planContent = readFileSync(planPath, "utf-8");
  const dayBrief = extractDayBrief(planContent, nextDay);

  const prompt = `You are a content writer for KiteHR, a free applicant tracking system (ATS) for small businesses and startups.

Write a complete, high-quality SEO blog post based on the following brief from the content plan:

${dayBrief}

## Writing Guidelines
- Voice: Practical, direct, no HR buzzwords. Write like a knowledgeable colleague.
- KiteHR mentions: Natural 1-2 paragraph mention in context — never a sales pitch.
- SEO: Primary keyword in the opening paragraph and at least two H2s.
- Include the CTA naturally near the end.
- Internal links from the brief should be referenced naturally in context.

## Output Format
Return a JSON object with this exact structure:

{
  "slug": "suggested-slug-from-brief",
  "title": "Full post title",
  "description": "Meta description 150-160 chars including primary keyword",
  "category": "One of: Guides, Hiring Tips, Templates, AI in HR, Recruiting, HR Operations",
  "readingTime": "X min read",
  "content": [
    { "type": "p", "content": "Opening paragraph text..." },
    { "type": "h2", "content": "Section heading" },
    { "type": "p", "content": "Paragraph text..." },
    { "type": "ul", "content": ["List item 1", "List item 2", "List item 3"] },
    { "type": "ol", "content": ["Step 1", "Step 2"] }
  ]
}

Content section types:
- "h2": section heading (content is a string)
- "h3": sub-heading (content is a string)
- "p": paragraph (content is a string)
- "ul": unordered list (content is an array of strings)
- "ol": ordered list (content is an array of strings)

Write the full post following the outline in the brief. Target the word count specified. Make it genuinely useful.`;

  const generated = await generateJSON<GeneratedPost>(proModel, prompt);

  // Store in database
  const post = await db.generatedBlogPost.create({
    data: {
      slug: generated.slug,
      title: generated.title,
      description: generated.description,
      content: generated.content as object[],
      category: generated.category,
      readingTime: generated.readingTime,
      planDay: nextDay,
    },
  });

  await db.cronLog.create({
    data: {
      job: "generate-blog-post",
      status: "success",
      message: `Generated Day ${nextDay}: "${generated.title}"`,
      details: { planDay: nextDay, slug: generated.slug, postId: post.id },
      durationMs: Date.now() - startedAt,
    },
  });

  return NextResponse.json({
    planDay: nextDay,
    slug: generated.slug,
    title: generated.title,
  });
}
