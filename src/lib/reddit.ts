/**
 * Reddit public JSON API client — no authentication required.
 * Reddit exposes read-only JSON endpoints without OAuth.
 * Comments must be posted manually from the admin UI.
 */

export interface RedditPost {
  id: string;
  name: string; // fullname, e.g. "t3_abc123"
  title: string;
  selftext: string;
  subreddit: string;
  url: string;
  permalink: string;
  created_utc: number;
}

const USER_AGENT = "KiteHR-Commenter/1.0 (draft mode)";

export async function searchSubreddit(
  subreddit: string,
  query: string,
  limit = 10
): Promise<RedditPost[]> {
  const url = new URL(`https://www.reddit.com/r/${subreddit}/search.json`);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "new");
  url.searchParams.set("t", "week");
  url.searchParams.set("restrict_sr", "true");
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    // Prevent Next.js from caching this fetch
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const children: { data: RedditPost }[] = data?.data?.children ?? [];
  return children.map((c) => c.data);
}
