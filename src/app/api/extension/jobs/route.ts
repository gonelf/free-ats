import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getExtensionMember, EXTENSION_CORS_HEADERS } from "@/lib/extension-auth";

export async function GET(request: NextRequest) {
  const member = await getExtensionMember(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: EXTENSION_CORS_HEADERS });
  }

  const jobs = await db.job.findMany({
    where: { organizationId: member.organizationId, status: "OPEN" },
    select: {
      id: true,
      title: true,
      pipeline: {
        select: {
          stages: {
            select: { id: true, name: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs, { headers: EXTENSION_CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: EXTENSION_CORS_HEADERS });
}
