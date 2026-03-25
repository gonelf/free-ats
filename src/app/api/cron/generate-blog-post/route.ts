import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJSON, generateText, proModel } from "@/lib/ai/gemini";
import { readFileSync } from "fs";
import { join } from "path";
import type { BlogSection } from "@/app/blog/posts";
import { postBlogPostToLinkedIn } from "@/lib/distribution/linkedin";

const TOTAL_PLAN_DAYS = 30;

function extractDayBrief(planContent: string, day: number): string {
  const dayHeader = `## Day ${day}\n`;
  const nextDayHeader = `## Day ${day + 1}\n`;
  const start = planContent.indexOf(dayHeader);
  if (start === -1) throw new Error(`Day ${day} not found in plan`);
  const end = day < TOTAL_PLAN_DAYS ? planContent.indexOf(nextDayHeader, start) : planContent.length;
  return planContent.slice(start, end === -1 ? planContent.length : end).trim();
}

function extractDayTitle(planContent: string, day: number): string | null {
  const brief = extractDayBrief(planContent, day);
  const match = brief.match(/\*\*Post Title:\*\*\s*(.+)/);
  return match ? match[1].trim() : null;
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
  // whose title hasn't already been published
  const publishedPosts = await db.generatedBlogPost.findMany({
    select: { planDay: true, title: true },
  });
  const publishedDays = new Set(publishedPosts.map((p) => p.planDay));
  const publishedTitles = new Set(publishedPosts.map((p) => p.title.toLowerCase()));

  const planPath = join(process.cwd(), "SEO_BLOG_PLAN.md");
  const planContent = readFileSync(planPath, "utf-8");

  let nextDay: number | null = null;
  for (let day = 1; day <= TOTAL_PLAN_DAYS; day++) {
    if (publishedDays.has(day)) continue;
    const title = extractDayTitle(planContent, day);
    if (title && publishedTitles.has(title.toLowerCase())) continue;
    nextDay = day;
    break;
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

  // Extract the brief for the selected day
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

  // Post to KiteHR's LinkedIn company page
  const kitehrOrgId = process.env.KITEHR_ORGANIZATION_ID;
  if (kitehrOrgId) {
    try {
      const linkedInIntegration = await db.integration.findFirst({
        where: { organizationId: kitehrOrgId, platform: "linkedin", enabled: true },
      });

      if (linkedInIntegration?.accessToken && linkedInIntegration.externalId) {
        const blogText = generated.content
          .map((section: BlogSection) =>
            Array.isArray(section.content)
              ? section.content.join("\n")
              : section.content
          )
          .join("\n\n")
          .slice(0, 2000);

        const linkedInPrompt = `You are writing a LinkedIn post for KiteHR's company page to promote a new blog article.

Blog Post Title: ${generated.title}
Blog Post Description: ${generated.description}
Blog Content:
${blogText}

Write an engaging LinkedIn post that:
- Opens with a compelling hook (a question, bold statement, or surprising insight)
- Shares 3-5 key takeaways from the article as short punchy lines
- Ends with a call-to-action inviting people to read the full article
- Includes 3-5 relevant hashtags (e.g. #hiring #recruiting #HR #smallbusiness #ATS)
- Is between 800-1300 characters total
- Sounds like a knowledgeable colleague sharing practical advice, not a marketing pitch

Do NOT include the blog URL — it will be attached as a link preview automatically.
Return only the post text, nothing else.`;

        const linkedInText = await generateText(proModel, linkedInPrompt);

        const linkedInPostUrn = await postBlogPostToLinkedIn(
          linkedInIntegration,
          linkedInText.trim(),
          generated.title,
          generated.description,
          generated.slug
        );

        await db.cronLog.create({
          data: {
            job: "generate-blog-post-linkedin",
            status: "success",
            message: `Posted Day ${nextDay} to LinkedIn: "${generated.title}"`,
            details: { planDay: nextDay, slug: generated.slug, linkedInPostUrn },
            durationMs: Date.now() - startedAt,
          },
        });
      }
    } catch (linkedInError) {
      await db.cronLog.create({
        data: {
          job: "generate-blog-post-linkedin",
          status: "error",
          message: `Failed to post Day ${nextDay} to LinkedIn: ${linkedInError instanceof Error ? linkedInError.message : String(linkedInError)}`,
          details: { planDay: nextDay, slug: generated.slug },
          durationMs: Date.now() - startedAt,
        },
      });
    }
  }

  return NextResponse.json({
    planDay: nextDay,
    slug: generated.slug,
    title: generated.title,
  });
}
