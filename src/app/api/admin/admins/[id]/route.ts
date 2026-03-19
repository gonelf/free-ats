import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentAdmin = await getAdminUser();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent removing yourself
  const target = await db.appAdmin.findUnique({ where: { id } });
  if (target?.email === currentAdmin.user.email) {
    return NextResponse.json({ error: "Cannot remove yourself as admin" }, { status: 400 });
  }

  try {
    await db.appAdmin.delete({ where: { id } });
    await logAudit({
      actorEmail: currentAdmin.user.email!,
      action: "admin.removed",
      entityType: "AppAdmin",
      entityId: id,
      entityName: target?.email,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }
}
