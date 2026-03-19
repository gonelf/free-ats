import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

async function authorize() {
  const admin = await getAdminUser();
  if (!admin) return null;
  return admin;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorize();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { plan, aiCreditsBalance } = body;

  try {
    const before = await db.organization.findUnique({ where: { id } });

    const updateData: Record<string, unknown> = {};
    if (plan !== undefined) updateData.plan = plan;
    if (aiCreditsBalance !== undefined) updateData.aiCreditsBalance = aiCreditsBalance;

    const org = await db.organization.update({
      where: { id },
      data: updateData,
    });

    if (plan !== undefined) {
      await logAudit({
        actorEmail: admin.user.email!,
        action: "org.plan_changed",
        entityType: "Organization",
        entityId: id,
        entityName: org.name,
        metadata: { from: before?.plan, to: plan },
        orgId: id,
      });
    }

    if (aiCreditsBalance !== undefined) {
      await logAudit({
        actorEmail: admin.user.email!,
        action: "org.credits_updated",
        entityType: "Organization",
        entityId: id,
        entityName: org.name,
        metadata: { from: before?.aiCreditsBalance, to: aiCreditsBalance },
        orgId: id,
      });
    }

    return NextResponse.json(org);
  } catch {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorize();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const org = await db.organization.findUnique({ where: { id } });
    await db.organization.delete({ where: { id } });
    await logAudit({
      actorEmail: admin.user.email!,
      action: "org.deleted",
      entityType: "Organization",
      entityId: id,
      entityName: org?.name,
      metadata: { plan: org?.plan },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
}
