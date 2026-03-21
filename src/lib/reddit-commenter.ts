import { db } from "@/lib/db";
import { flashModel, generateText } from "@/lib/ai/gemini";
import { searchSubreddit, postComment, type RedditPost } from "@/lib/reddit";

const DEFAULT_SUBREDDITS = [
  "recruiting",
  "humanresources",
  "startups",
  "smallbusiness",
  "entrepreneur",
  "hiring",
];

const DEFAULT_KEYWORDS = [
  "applicant tracking",
  "ATS",
  "hiring software",
  "job posting",
  "track candidates",
  "recruiting tool",
  "manage applications",
];

// Maximum new posts to comment on per run (keeps things natural)
const MAX_COMMENTS_PER_RUN = 5;

export interface CommenterResult {
  posted: number;
  skipped: number;
  failed: number;
}

export async function runRedditCommenter(): Promise<CommenterResult> {
  // Load config; create singleton with defaults if it doesn't exist yet
  let config = await db.redditConfig.findUnique({ where: { id: "singleton" } });
  if (!config) {
    config = await db.redditConfig.create({
      data: {
        id: "singleton",
        enabled: false,
        subreddits: DEFAULT_SUBREDDITS,
        keywords: DEFAULT_KEYWORDS,
      },
    });
  }

  if (!config.enabled) {
    return { posted: 0, skipped: 0, failed: 0 };
  }

  const subreddits = config.subreddits.length ? config.subreddits : DEFAULT_SUBREDDITS;
  const keywords = config.keywords.length ? config.keywords : DEFAULT_KEYWORDS;

  // Collect candidate posts
  const seenPostIds = new Set<string>();
  const candidates: RedditPost[] = [];

  for (const subreddit of subreddits) {
    for (const keyword of keywords) {
      try {
        const posts = await searchSubreddit(subreddit, keyword, 5);
        for (const post of posts) {
          if (!seenPostIds.has(post.id)) {
            seenPostIds.add(post.id);
            candidates.push(post);
          }
        }
      } catch {
        // Non-fatal; continue with other searches
      }
    }
  }

  // Filter out posts already commented on
  const existingPostIds = await db.redditComment
    .findMany({
      where: { postId: { in: candidates.map((p) => p.id) } },
      select: { postId: true },
    })
    .then((rows) => new Set(rows.map((r) => r.postId)));

  const newPosts = candidates.filter((p) => !existingPostIds.has(p.id));

  let posted = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of newPosts) {
    if (posted >= MAX_COMMENTS_PER_RUN) break;

    const postUrl = `https://reddit.com${post.permalink}`;

    // Skip posts with no meaningful content
    if (!post.title || post.title.length < 10) {
      skipped++;
      await db.redditComment.create({
        data: {
          postId: post.id,
          postTitle: post.title || "(no title)",
          subreddit: post.subreddit,
          postUrl,
          commentText: "",
          status: "skipped",
          errorMsg: "Post title too short",
        },
      });
      continue;
    }

    try {
      const commentText = await generateComment(post);

      const commentId = await postComment(post.name, commentText);

      await db.redditComment.create({
        data: {
          postId: post.id,
          postTitle: post.title,
          subreddit: post.subreddit,
          postUrl,
          commentId,
          commentText,
          status: "posted",
        },
      });

      posted++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      failed++;

      await db.redditComment.create({
        data: {
          postId: post.id,
          postTitle: post.title,
          subreddit: post.subreddit,
          postUrl,
          commentText: "",
          status: "failed",
          errorMsg,
        },
      });
    }
  }

  return { posted, skipped, failed };
}

async function generateComment(post: RedditPost): Promise<string> {
  const bodyPreview = post.selftext
    ? post.selftext.slice(0, 500)
    : "(no body text)";

  const prompt = `You are a helpful community member on Reddit who works in HR tech.
Someone posted in r/${post.subreddit} with the following:

Title: "${post.title}"
Body: "${bodyPreview}"

Write a genuine, helpful 2-4 sentence reply that:
1. Directly addresses the specific problem or question they raised
2. Provides practical, actionable advice or a relevant insight
3. Naturally mentions KiteHR (https://kitehr.com) as a free applicant tracking tool they might find useful — but only if it fits organically and is genuinely relevant to their question
4. Sounds like a real person, not a bot or marketer
5. Never starts with "I" and avoids generic openers like "Great question!"

If their post is not about hiring, recruiting, job posting, or managing candidates, respond with only the exact text: SKIP

Only output the comment text itself. No quotes, no preamble.`;

  const result = await generateText(flashModel, prompt);
  const trimmed = result.trim();

  if (trimmed === "SKIP") {
    throw new Error("Post not relevant to hiring/ATS — skipped by AI");
  }

  return trimmed;
}
