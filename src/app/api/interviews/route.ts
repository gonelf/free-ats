import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: { select: { id: true } } },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const applicationIdsParam = searchParams.get("applicationIds");
  const applicationIds = applicationIdsParam ? applicationIdsParam.split(",") : [];

  if (applicationIds.length === 0) return NextResponse.json([]);

  const interviews = await db.interview.findMany({
    where: {
      applicationId: { in: applicationIds },
      application: { job: { organizationId: member.organization.id } },
    },
    include: {
      feedbacks: {
        select: {
          id: true,
          overallRating: true,
          recommendation: true,
          notes: true,
          aiDrafted: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(interviews);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: { select: { id: true } } },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { applicationId, title, scheduledAt, duration, meetingLink, timezone, notes } =
    await request.json();

  // Verify application belongs to this org
  const application = await db.application.findFirst({
    where: { id: applicationId, job: { organizationId: member.organization.id } },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const interview = await db.interview.create({
    data: {
      applicationId,
      title: title ?? "Interview",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      duration: duration ?? 60,
      meetingLink: meetingLink ?? null,
      timezone: timezone ?? "UTC",
      notes: notes ?? null,
    },
  });

  return NextResponse.json(interview, { status: 201 });
}
