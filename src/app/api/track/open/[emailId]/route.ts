import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/track/open/[emailId] — 1x1 transparent pixel, records open event
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  const { emailId } = await params;

  // Record first open only
  await db.outreachEmail.updateMany({
    where: { id: emailId, openedAt: null },
    data: { openedAt: new Date() },
  });

  // Return 1x1 transparent GIF
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Length": String(pixel.length),
    },
  });
}
