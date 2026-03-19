import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";

export async function DELETE() {
  if (!(await isFlagEnabled(FLAGS.JOB_DISTRIBUTION))) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirstOrThrow({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const integration = await db.integration.findUnique({
    where: {
      organizationId_platform: {
        organizationId: member.organizationId,
        platform: "linkedin",
      },
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Not connected" }, { status: 404 });
  }

  // Mark active distributions as closed
  await db.jobDistribution.updateMany({
    where: {
      job: { organizationId: member.organizationId },
      platform: "linkedin",
      status: { in: ["pending", "distributed"] },
    },
    data: { status: "closed" },
  });

  await db.integration.delete({
    where: {
      organizationId_platform: {
        organizationId: member.organizationId,
        platform: "linkedin",
      },
    },
  });

  return NextResponse.json({ ok: true });
}
