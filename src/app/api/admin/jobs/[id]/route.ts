import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  try {
    const before = await db.job.findUnique({ where: { id } });
    const job = await db.job.update({
      where: { id },
      data: { status },
    });
    await logAudit({
      actorEmail: admin.user.email!,
      action: "job.status_changed",
      entityType: "Job",
      entityId: id,
      entityName: job.title,
      metadata: { from: before?.status, to: status },
      orgId: job.organizationId,
    });
    return NextResponse.json(job);
  } catch {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
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
    const job = await db.job.findUnique({ where: { id } });
    await db.job.delete({ where: { id } });
    await logAudit({
      actorEmail: admin.user.email!,
      action: "job.deleted",
      entityType: "Job",
      entityId: id,
      entityName: job?.title,
      orgId: job?.organizationId,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}
