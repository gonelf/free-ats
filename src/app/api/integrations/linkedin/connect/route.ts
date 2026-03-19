import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";
import { getAdminUser } from "@/lib/admin";

export async function GET() {
  const isAdmin = !!(await getAdminUser());
  if (!(await isFlagEnabled(FLAGS.JOB_DISTRIBUTION, isAdmin))) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "LinkedIn not configured" }, { status: 500 });
  }

  // Store the user's org so we can retrieve it in the callback
  const member = await db.member.findFirstOrThrow({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const state = Buffer.from(
    JSON.stringify({ orgId: member.organizationId, ts: Date.now() })
  ).toString("base64url");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "r_organization_admin rw_organization_admin w_member_social",
  });

  const response = NextResponse.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params}`
  );

  // Store state in a short-lived cookie for CSRF verification
  response.cookies.set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return response;
}
