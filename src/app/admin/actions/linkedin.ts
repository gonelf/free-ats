"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateText, proModel } from "@/lib/ai/gemini";
import { postBlogPostToLinkedIn, commentOnLinkedInPost } from "@/lib/distribution/linkedin";
import type { BlogSection } from "@/app/blog/posts";

export async function triggerLinkedInPost(postId: string) {
  await requireAdmin();

  const post = await db.generatedBlogPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Blog post not found");

  const linkedInIntegration = await db.platformIntegration.findUnique({
    where: { platform: "linkedin_blog" },
  });

  if (!linkedInIntegration?.accessToken || !linkedInIntegration.externalId || !linkedInIntegration.enabled) {
    throw new Error(
      "KiteHR LinkedIn integration is not connected. " +
      "Go to Admin → Connect LinkedIn to set it up."
    );
  }

  const blogText = (post.content as BlogSection[])
    .map((section) =>
      Array.isArray(section.content)
        ? section.content.join("\n")
        : section.content
    )
    .join("\n\n")
    .slice(0, 2000);

  const linkedInPrompt = `You are writing a LinkedIn post for KiteHR's company page to promote a new blog article.

Blog Post Title: ${post.title}
Blog Post Description: ${post.description}
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
    post.title,
    post.description,
    post.slug
  );

  const blogUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://kitehr.co"}/blog/${post.slug}`;

  if (linkedInPostUrn) {
    await commentOnLinkedInPost(
      linkedInIntegration,
      linkedInPostUrn,
      `Read the full article here 👉 ${blogUrl}`
    );
  }

  await db.cronLog.create({
    data: {
      job: "generate-blog-post-linkedin",
      status: "success",
      message: `[Manual] Posted "${post.title}" to LinkedIn`,
      details: { postId, slug: post.slug, linkedInPostUrn },
      durationMs: 0,
    },
  });

  return { linkedInPostUrn, blogUrl };
}

export async function getGeneratedBlogPosts() {
  await requireAdmin();

  return db.generatedBlogPost.findMany({
    select: { id: true, title: true, slug: true, planDay: true, createdAt: true },
    orderBy: { planDay: "asc" },
  });
}

export async function getLinkedInStatus() {
  await requireAdmin();

  const integration = await db.platformIntegration.findUnique({
    where: { platform: "linkedin_blog" },
    select: { enabled: true, externalId: true, tokenExpiresAt: true, accessToken: true },
  });

  if (!integration) return { connected: false } as const;

  const hasToken = !!integration.accessToken;
  const hasOrgId = !!integration.externalId;

  return {
    connected: true,
    ready: hasToken && hasOrgId && integration.enabled,
    enabled: integration.enabled,
    externalId: integration.externalId,
    tokenExpiresAt: integration.tokenExpiresAt,
    missingOrgId: !hasOrgId,
  } as const;
}

export async function disconnectLinkedIn() {
  await requireAdmin();

  await db.platformIntegration.delete({ where: { platform: "linkedin_blog" } });
}
