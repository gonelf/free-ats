import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getExtensionMember, EXTENSION_CORS_HEADERS } from "@/lib/extension-auth";

export async function GET(request: NextRequest) {
  const member = await getExtensionMember(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: EXTENSION_CORS_HEADERS });
  }

  const { searchParams } = new URL(request.url);
  const linkedinUrl = searchParams.get("linkedinUrl");
  const email = searchParams.get("email");

  if (!linkedinUrl && !email) {
    return NextResponse.json(
      { error: "Provide linkedinUrl or email" },
      { status: 400, headers: EXTENSION_CORS_HEADERS }
    );
  }

  const candidate = await db.candidate.findFirst({
    where: {
      organizationId: member.organizationId,
      ...(linkedinUrl ? { linkedinUrl } : { email: email! }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      linkedinUrl: true,
    },
  });

  return NextResponse.json(
    { exists: !!candidate, candidate: candidate ?? null },
    { headers: EXTENSION_CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: EXTENSION_CORS_HEADERS });
}
