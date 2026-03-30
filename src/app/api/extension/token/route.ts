import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { sha256hex, EXTENSION_CORS_HEADERS } from "@/lib/extension-auth";

// GET — list tokens for the org
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({ where: { userId: user.id } });
  if (!member) return NextResponse.json({ error: "No org" }, { status: 403 });

  const tokens = await db.extensionToken.findMany({
    where: { organizationId: member.organizationId },
    select: { id: true, label: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tokens);
}

// POST — generate a new token
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({ where: { userId: user.id } });
  if (!member) return NextResponse.json({ error: "No org" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const label = (body.label as string) || "Chrome Extension";

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = sha256hex(rawToken);

  const record = await db.extensionToken.create({
    data: {
      organizationId: member.organizationId,
      userId: user.id,
      label,
      tokenHash,
    },
  });

  // Return raw token — only time it's ever shown
  return NextResponse.json({
    id: record.id,
    label: record.label,
    createdAt: record.createdAt,
    token: rawToken,
  });
}

// DELETE — revoke by ?id=...
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({ where: { userId: user.id } });
  if (!member) return NextResponse.json({ error: "No org" }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const token = await db.extensionToken.findFirst({
    where: { id, organizationId: member.organizationId },
  });
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.extensionToken.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: EXTENSION_CORS_HEADERS });
}
