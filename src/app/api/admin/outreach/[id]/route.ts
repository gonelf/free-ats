import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

// GET /api/admin/outreach/[id] — lead detail with email history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const lead = await db.outreachLead.findUnique({
    where: { id },
    include: { emails: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

// PATCH /api/admin/outreach/[id] — update status, notes, contact info
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { status, notes, contactEmail, contactName, website, hiringFor } = body;

  const lead = await db.outreachLead.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(contactEmail !== undefined ? { contactEmail } : {}),
      ...(contactName !== undefined ? { contactName } : {}),
      ...(website !== undefined ? { website } : {}),
      ...(hiringFor !== undefined ? { hiringFor } : {}),
    },
  });

  return NextResponse.json(lead);
}

// DELETE /api/admin/outreach/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.outreachLead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
