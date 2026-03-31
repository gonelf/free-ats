import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getExtensionMember, EXTENSION_CORS_HEADERS } from "@/lib/extension-auth";

export async function POST(request: NextRequest) {
  const member = await getExtensionMember(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: EXTENSION_CORS_HEADERS });
  }

  const { candidateId, jobId, stageId } = (await request.json()) as {
    candidateId: string;
    jobId: string;
    stageId?: string;
  };

  if (!candidateId || !jobId) {
    return NextResponse.json(
      { error: "candidateId and jobId are required" },
      { status: 400, headers: EXTENSION_CORS_HEADERS }
    );
  }

  // Verify candidate and job belong to this org
  const [candidate, job] = await Promise.all([
    db.candidate.findFirst({ where: { id: candidateId, organizationId: member.organizationId } }),
    db.job.findFirst({
      where: { id: jobId, organizationId: member.organizationId },
      include: { pipeline: { include: { stages: { orderBy: { order: "asc" }, take: 1 } } } },
    }),
  ]);

  if (!candidate || !job) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: EXTENSION_CORS_HEADERS });
  }

  const resolvedStageId = stageId ?? job.pipeline.stages[0]?.id;
  if (!resolvedStageId) {
    return NextResponse.json(
      { error: "No stages in pipeline" },
      { status: 422, headers: EXTENSION_CORS_HEADERS }
    );
  }

  try {
    const application = await db.application.create({
      data: { jobId, candidateId, stageId: resolvedStageId },
    });
    return NextResponse.json(application, { status: 201, headers: EXTENSION_CORS_HEADERS });
  } catch (err: unknown) {
    // Unique constraint violation — already assigned
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      const existing = await db.application.findFirst({ where: { jobId, candidateId } });
      return NextResponse.json(
        { ...existing, alreadyAssigned: true },
        { headers: EXTENSION_CORS_HEADERS }
      );
    }
    throw err;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: EXTENSION_CORS_HEADERS });
}
