import { Devvit, SettingScope } from "@devvit/public-api";

// ── Configuration ──────────────────────────────────────────────────────────

Devvit.configure({
  redditAPI: true,
  http: true, // enables global fetch; Gemini domain is publicly routable
  redis: true,
});

// ── Settings ───────────────────────────────────────────────────────────────

Devvit.addSettings([
  {
    type: "string",
    name: "gemini-api-key",
    label: "Google Gemini API Key",
    isSecret: true,
    scope: SettingScope.App,
    // Set via CLI: devvit settings set gemini-api-key
  },
  {
    type: "string",
    name: "target-subreddits",
    label: "Target subreddits (comma-separated, without r/)",
    defaultValue:
      "recruiting,humanresources,startups,smallbusiness,entrepreneur,hiring",
    scope: SettingScope.Installation,
  },
  {
    type: "string",
    name: "keywords",
    label: "Keywords to match in post title/body (comma-separated)",
    defaultValue:
      "applicant tracking,ats,hiring software,job posting,track candidates,recruiting tool,manage applications",
    scope: SettingScope.Installation,
  },
]);

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_COMMENTS_PER_RUN = 5;
const POSTS_PER_SUBREDDIT = 25;
const REDIS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SKIP_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for skipped posts

// ── Scheduler job ──────────────────────────────────────────────────────────

Devvit.addSchedulerJob({
  name: "post-kite-comments",
  onRun: async (_event, context) => {
    const geminiKey = await context.settings.get<string>("gemini-api-key");
    if (!geminiKey) {
      console.error(
        "[KiteHR] Gemini API key not set. Run: devvit settings set gemini-api-key"
      );
      return;
    }

    const subredditsStr =
      (await context.settings.get<string>("target-subreddits")) ??
      "recruiting,humanresources,startups,smallbusiness,entrepreneur,hiring";
    const keywordsStr =
      (await context.settings.get<string>("keywords")) ??
      "applicant tracking,ats,hiring software,job posting";

    const subreddits = subredditsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const keywords = keywordsStr
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    let commented = 0;

    for (const subreddit of subreddits) {
      if (commented >= MAX_COMMENTS_PER_RUN) break;

      try {
        const posts = await context.reddit
          .getNewPosts({
            subredditName: subreddit,
            limit: POSTS_PER_SUBREDDIT,
          })
          .all();

        // Filter client-side by keywords in title or body
        const matches = posts.filter((post) => {
          const searchable = `${post.title} ${post.body ?? ""}`.toLowerCase();
          return keywords.some((kw) => searchable.includes(kw));
        });

        for (const post of matches) {
          if (commented >= MAX_COMMENTS_PER_RUN) break;

          const redisKey = `kite:${post.id}`;
          const alreadySeen = await context.redis.get(redisKey);
          if (alreadySeen) continue;

          const commentText = await generateComment(
            post.title,
            post.body ?? "",
            subreddit,
            geminiKey
          );

          if (!commentText) {
            // Mark as skipped so we don't retry this post
            await context.redis.set(redisKey, "skipped", {
              expiration: new Date(Date.now() + SKIP_TTL_MS),
            });
            continue;
          }

          // post.id is the bare ID; submitComment needs the full thing ID
          await context.reddit.submitComment({
            id: `t3_${post.id}`,
            text: commentText,
          });

          await context.redis.set(redisKey, "posted", {
            expiration: new Date(Date.now() + REDIS_TTL_MS),
          });

          commented++;
          console.log(
            `[KiteHR] Commented on r/${subreddit} — "${post.title.slice(0, 60)}"`
          );
        }
      } catch (err) {
        console.error(`[KiteHR] Error processing r/${subreddit}:`, err);
      }
    }

    console.log(`[KiteHR] Run complete — ${commented} comment(s) posted`);
  },
});

// ── Install trigger — starts the recurring scheduler ──────────────────────

Devvit.addTrigger({
  event: "AppInstall",
  onEvent: async (_event, context) => {
    // Cancel any existing job first (handles reinstalls)
    const existingJobId = await context.redis.get("schedulerJobId");
    if (existingJobId) {
      try {
        await context.scheduler.cancelJob(existingJobId);
      } catch {
        // Job may have already expired — safe to ignore
      }
    }

    const jobId = await context.scheduler.runJob({
      name: "post-kite-comments",
      cron: "0 */6 * * *", // every 6 hours
    });

    await context.redis.set("schedulerJobId", jobId);
    console.log(`[KiteHR] Scheduler started (job ID: ${jobId})`);
  },
});

// ── Gemini comment generation ──────────────────────────────────────────────

async function generateComment(
  title: string,
  body: string,
  subreddit: string,
  apiKey: string
): Promise<string | null> {
  const bodyPreview = body.slice(0, 500);

  const prompt = `You are a helpful community member on Reddit who works in HR tech.
Someone posted in r/${subreddit}:

Title: "${title}"
Body: "${bodyPreview}"

Write a genuine, helpful 2-4 sentence reply that:
1. Directly addresses their specific problem or question
2. Provides practical, actionable advice
3. Naturally mentions KiteHR (https://kitehr.com) as a free applicant tracking tool — only if genuinely relevant to hiring or candidate management
4. Sounds like a real person, not a bot or marketer
5. Never starts with "I" or "Great question!"

If the post is not about hiring, recruiting, job posting, or candidate management, respond with only the exact text: SKIP

Output only the comment text itself. No quotes, no preamble.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      console.error(`[KiteHR] Gemini HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!text || text === "SKIP") return null;
    return text;
  } catch (err) {
    console.error("[KiteHR] Gemini fetch error:", err);
    return null;
  }
}

export default Devvit;
