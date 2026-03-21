import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";
import { runRedditCommenter } from "@/lib/reddit-commenter";

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

async function requireAdminUser() {
  const result = await getAdminUser();
  if (!result) return null;
  return result;
}

/** GET — fetch config + recent comments + stats */
export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const [recentComments, totalDrafted, pendingDrafts] = await Promise.all([
    db.redditComment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.redditComment.count({ where: { status: { in: ["draft", "posted"] } } }),
    db.redditComment.count({ where: { status: "draft" } }),
  ]);

  const totalAttempted = await db.redditComment.count();

  return NextResponse.json({
    config,
    recentComments,
    stats: { totalDrafted, pendingDrafts, totalAttempted },
  });
}

/** POST — manual trigger or mark-as-posted */
export async function POST(request: NextRequest) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  if (body?.action === "run") {
    const result = await runRedditCommenter();
    return NextResponse.json(result);
  }

  if (body?.action === "mark-posted" && body?.id) {
    const updated = await db.redditComment.update({
      where: { id: body.id },
      data: { status: "posted" },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

/** PATCH — update config */
export async function PATCH(request: NextRequest) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { enabled, subreddits, keywords } = body;

  const updated = await db.redditConfig.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      enabled: enabled ?? false,
      subreddits: subreddits ?? DEFAULT_SUBREDDITS,
      keywords: keywords ?? DEFAULT_KEYWORDS,
    },
    update: {
      ...(typeof enabled === "boolean" && { enabled }),
      ...(Array.isArray(subreddits) && { subreddits }),
      ...(Array.isArray(keywords) && { keywords }),
    },
  });

  return NextResponse.json(updated);
}
