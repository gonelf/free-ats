import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { seedDefaultFlags } from "@/lib/feature-flags";

export async function GET() {
  await requireAdmin();
  await seedDefaultFlags();

  const flags = await db.featureFlag.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json(flags);
}

export async function PATCH(request: NextRequest) {
  await requireAdmin();

  const { key, enabled } = await request.json();

  if (typeof key !== "string" || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const flag = await db.featureFlag.update({
    where: { key },
    data: { enabled },
  });

  return NextResponse.json(flag);
}
