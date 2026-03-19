import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { seedDefaultFlags } from "@/lib/feature-flags";
import { FlagRollout } from "@prisma/client";

export async function GET() {
  await requireAdmin();
  await seedDefaultFlags();

  const flags = await db.featureFlag.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json(flags);
}

const VALID_ROLLOUTS: FlagRollout[] = [
  FlagRollout.DISABLED,
  FlagRollout.ADMINS,
  FlagRollout.EVERYONE,
];

export async function PATCH(request: NextRequest) {
  await requireAdmin();

  const { key, rollout } = await request.json();

  if (typeof key !== "string" || !VALID_ROLLOUTS.includes(rollout)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const flag = await db.featureFlag.update({
    where: { key },
    data: { rollout },
  });

  return NextResponse.json(flag);
}
