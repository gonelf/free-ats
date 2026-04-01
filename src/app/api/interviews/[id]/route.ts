import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: { select: { id: true } } },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify interview belongs to this org via application → job
  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: member.organization.id } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, scheduledAt, duration, meetingLink, timezone, status, notes } =
    await request.json();

  const updated = await db.interview.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      ...(duration !== undefined && { duration }),
      ...(meetingLink !== undefined && { meetingLink }),
      ...(timezone !== undefined && { timezone }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: { select: { id: true } } },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: member.organization.id } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.interview.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
