import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { resumeExpiresAt } = body;

  try {
    const candidate = await db.candidate.update({
      where: { id },
      data: {
        resumeExpiresAt: resumeExpiresAt ? new Date(resumeExpiresAt) : null,
      },
    });
    return NextResponse.json(candidate);
  } catch {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await db.candidate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
}
