import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { getResumeDownloadUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const member = await db.member.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await db.candidate.findFirst({
    where: { id, organizationId: member.organizationId },
    select: { resumeUrl: true, resumeExpiresAt: true },
  });

  if (!candidate?.resumeUrl) {
    return NextResponse.json({ error: "No resume found" }, { status: 404 });
  }

  if (candidate.resumeExpiresAt && candidate.resumeExpiresAt < new Date()) {
    return NextResponse.json(
      { error: "Resume has expired. Upgrade to Pro to retain resumes." },
      { status: 410 }
    );
  }

  const url = await getResumeDownloadUrl(candidate.resumeUrl);
  return NextResponse.redirect(url);
}
