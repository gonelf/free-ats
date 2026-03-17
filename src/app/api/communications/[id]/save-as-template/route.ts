import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await db.member.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  if (!member) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const comm = await db.communication.findFirst({
    where: { id, organizationId: member.organizationId },
    include: { job: { select: { title: true } } },
  });
  if (!comm) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const jobTitle = comm.job?.title ?? "General";
  const template = await db.emailTemplate.create({
    data: {
      organizationId: member.organizationId,
      name: `${comm.type.replace(/_/g, " ")} — ${jobTitle}`,
      type: "CUSTOM",
      subject: comm.subject,
      body: comm.body,
    },
  });

  return NextResponse.json({ templateId: template.id });
}
