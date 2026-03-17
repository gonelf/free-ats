import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await db.member.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  if (!member) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const communication = await db.communication.findFirst({
    where: { id, organizationId: member.organizationId },
  });
  if (!communication) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.communication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
