import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const admin = await db.appAdmin.create({ data: { email } });
    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Email already exists as admin" }, { status: 409 });
  }
}
