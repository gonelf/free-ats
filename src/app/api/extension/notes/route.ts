import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getExtensionMember, EXTENSION_CORS_HEADERS } from "@/lib/extension-auth";

export async function POST(request: NextRequest) {
  const member = await getExtensionMember(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: EXTENSION_CORS_HEADERS });
  }

  const { candidateId, content } = (await request.json()) as {
    candidateId: string;
    content: string;
  };

  if (!candidateId || !content?.trim()) {
    return NextResponse.json(
      { error: "candidateId and content are required" },
      { status: 400, headers: EXTENSION_CORS_HEADERS }
    );
  }

  // Verify candidate belongs to this org
  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, organizationId: member.organizationId },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: EXTENSION_CORS_HEADERS });
  }

  const note = await db.note.create({
    data: { candidateId, authorId: member.userId, content: content.trim() },
  });

  return NextResponse.json(note, { status: 201, headers: EXTENSION_CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: EXTENSION_CORS_HEADERS });
}
