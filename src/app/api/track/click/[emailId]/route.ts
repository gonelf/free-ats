import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/track/click/[emailId]?url=... — records click, redirects to destination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  const { emailId } = await params;
  const destination = request.nextUrl.searchParams.get("url") ?? "https://kitehr.co";

  // Record first click only
  await db.outreachEmail.updateMany({
    where: { id: emailId, clickedAt: null },
    data: { clickedAt: new Date() },
  });

  return NextResponse.redirect(destination, { status: 302 });
}
