import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

// GET /api/admin/outreach — list leads with optional filters
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const source = searchParams.get("source") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 50;

  const where = {
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
  };

  const [leads, total] = await Promise.all([
    db.outreachLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { emails: true } },
      },
    }),
    db.outreachLead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, pageSize });
}

// POST /api/admin/outreach — create a manual lead
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { companyName, website, contactEmail, contactName, hiringFor, notes } = body;

  if (!companyName) {
    return NextResponse.json({ error: "companyName is required" }, { status: 400 });
  }

  const lead = await db.outreachLead.create({
    data: {
      companyName,
      website: website ?? null,
      contactEmail: contactEmail ?? null,
      contactName: contactName ?? null,
      hiringFor: hiringFor ?? null,
      notes: notes ?? null,
      source: "manual",
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
