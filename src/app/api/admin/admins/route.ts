import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const currentAdmin = await getAdminUser();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const admin = await db.appAdmin.create({ data: { email } });
    await logAudit({
      actorEmail: currentAdmin.user.email!,
      action: "admin.added",
      entityType: "AppAdmin",
      entityId: admin.id,
      entityName: email,
    });
    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Email already exists as admin" }, { status: 409 });
  }
}
