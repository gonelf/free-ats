/**
 * Reddit API client using OAuth2 "script" app flow (username + password).
 * Tokens are cached in module scope and refreshed automatically when near expiry.
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

interface TokenCache {
  accessToken: string;
  expiresAt: number; // unix ms
}

let tokenCache: TokenCache | null = null;

async function getRedditToken(): Promise<string> {
  const now = Date.now();

  // Refresh if missing or within 60s of expiry
  if (tokenCache && tokenCache.expiresAt - now > 60_000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID!;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!;
  const username = process.env.REDDIT_USERNAME!;
  const password = process.env.REDDIT_PASSWORD!;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.REDDIT_USER_AGENT ?? "KiteHR-Bot/1.0",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username,
      password,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return tokenCache.accessToken;
}

export async function searchSubreddit(
  subreddit: string,
  query: string,
  limit = 10
): Promise<RedditPost[]> {
  const token = await getRedditToken();
  const userAgent = process.env.REDDIT_USER_AGENT ?? "KiteHR-Bot/1.0";

  const url = new URL(`https://oauth.reddit.com/r/${subreddit}/search.json`);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "new");
  url.searchParams.set("t", "week");
  url.searchParams.set("restrict_sr", "true");
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const children: { data: RedditPost }[] = data?.data?.children ?? [];
  return children.map((c) => c.data);
}

export async function postComment(
  parentThingId: string,
  text: string
): Promise<string> {
  const token = await getRedditToken();
  const userAgent = process.env.REDDIT_USER_AGENT ?? "KiteHR-Bot/1.0";

  const res = await fetch("https://oauth.reddit.com/api/comment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      thing_id: parentThingId,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Reddit comment failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  // Response structure: { json: { data: { things: [{ data: { id, name } }] } } }
  const commentId: string | undefined =
    data?.json?.data?.things?.[0]?.data?.name;

  if (!commentId) {
    throw new Error("Reddit comment posted but no comment ID returned");
  }

  return commentId;
}
