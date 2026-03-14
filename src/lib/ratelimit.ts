import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      // 10 AI requests per 60 seconds per user
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "ats:ai",
    });
  }

  return ratelimit;
}

/**
 * Check rate limit for a given identifier (e.g. userId or orgId).
 * Returns a 429 response if over the limit, or null if allowed.
 */
export async function checkRateLimit(
  identifier: string
): Promise<NextResponse | null> {
  const limiter = getRatelimit();

  if (!limiter) {
    // Rate limiting not configured — allow all requests
    return null;
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}
