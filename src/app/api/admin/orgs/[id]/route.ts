import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

async function authorize() {
  const admin = await getAdminUser();
  if (!admin) return null;
  return admin;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await authorize())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { plan, aiCreditsBalance } = body;

  try {
    const updateData: Record<string, unknown> = {};
    if (plan !== undefined) updateData.plan = plan;
    if (aiCreditsBalance !== undefined) updateData.aiCreditsBalance = aiCreditsBalance;

    const org = await db.organization.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(org);
  } catch {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await authorize())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await db.organization.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
}
