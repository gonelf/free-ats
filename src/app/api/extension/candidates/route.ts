import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getExtensionMember, EXTENSION_CORS_HEADERS } from "@/lib/extension-auth";

export async function POST(request: NextRequest) {
  const member = await getExtensionMember(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: EXTENSION_CORS_HEADERS });
  }

  const body = await request.json();
  const {
    firstName,
    lastName,
    email: rawEmail,
    phone,
    linkedinUrl,
    summary,
    workExperience,
    jobId,
    stageId,
  } = body as {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    summary?: string;
    workExperience?: Array<{ title?: string; company?: string; dateRange?: string }>;
    jobId?: string;
    stageId?: string;
  };

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "firstName and lastName are required" },
      { status: 400, headers: EXTENSION_CORS_HEADERS }
    );
  }

  // Email is required by DB unique constraint. Generate a placeholder if not provided.
  const email = rawEmail?.trim() || `sourced-${randomBytes(8).toString("hex")}@placeholder.kitehr`;

  const candidate = await db.candidate.create({
    data: {
      organizationId: member.organizationId,
      firstName,
      lastName,
      email,
      phone: phone || null,
      linkedinUrl: linkedinUrl || null,
      summary: summary || null,
      workExperience: workExperience ?? undefined,
    },
  });

  // Optionally assign to a job stage in the same request
  if (jobId) {
    let resolvedStageId = stageId;

    if (!resolvedStageId) {
      // Default to first stage of the job's pipeline
      const job = await db.job.findFirst({
        where: { id: jobId, organizationId: member.organizationId },
        include: {
          pipeline: { include: { stages: { orderBy: { order: "asc" }, take: 1 } } },
        },
      });
      resolvedStageId = job?.pipeline.stages[0]?.id;
    }

    if (resolvedStageId) {
      await db.application.create({
        data: { jobId, candidateId: candidate.id, stageId: resolvedStageId },
      });
    }
  }

  return NextResponse.json(candidate, { status: 201, headers: EXTENSION_CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: EXTENSION_CORS_HEADERS });
}
