import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { resumeExpiresAt } = body;

  try {
    const candidate = await db.candidate.update({
      where: { id },
      data: {
        resumeExpiresAt: resumeExpiresAt ? new Date(resumeExpiresAt) : null,
      },
    });
    return NextResponse.json(candidate);
  } catch {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const candidate = await db.candidate.findUnique({ where: { id } });
    await db.candidate.delete({ where: { id } });
    await logAudit({
      actorEmail: admin.user.email!,
      action: "candidate.deleted",
      entityType: "Candidate",
      entityId: id,
      entityName: candidate ? `${candidate.firstName} ${candidate.lastName}` : undefined,
      orgId: candidate?.organizationId,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
}
