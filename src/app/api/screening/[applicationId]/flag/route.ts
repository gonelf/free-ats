import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: { select: { id: true } } },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify application belongs to org
  const application = await db.application.findFirst({
    where: { id: applicationId, job: { organizationId: member.organization.id } },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { flagged, flagReason } = await request.json();

  const updated = await db.screening.update({
    where: { applicationId },
    data: {
      flagged: flagged ?? false,
      flagReason: flagged ? (flagReason ?? "Manually flagged") : null,
    },
  });

  return NextResponse.json(updated);
}
