import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  if (!member) return NextResponse.json({ error: "No org" }, { status: 403 });

  const formData = await request.formData();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const linkedinUrl = (formData.get("linkedinUrl") as string) || null;
  const jobId = formData.get("jobId") as string | null;

  const candidate = await db.candidate.create({
    data: {
      organizationId: member.organizationId,
      firstName,
      lastName,
      email,
      phone,
      linkedinUrl,
    },
  });

  // If jobId provided, add to first stage of job's pipeline
  if (jobId) {
    const job = await db.job.findFirst({
      where: { id: jobId, organizationId: member.organizationId },
      include: {
        pipeline: {
          include: { stages: { orderBy: { order: "asc" }, take: 1 } },
        },
      },
    });

    if (job?.pipeline.stages[0]) {
      await db.application.create({
        data: {
          jobId,
          candidateId: candidate.id,
          stageId: job.pipeline.stages[0].id,
        },
      });
    }
  }

  return NextResponse.json(candidate);
}
