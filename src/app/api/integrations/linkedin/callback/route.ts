import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";

export async function GET(request: NextRequest) {
  if (!(await isFlagEnabled(FLAGS.JOB_DISTRIBUTION))) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/settings?integration_error=${encodeURIComponent(error)}`
    );
  }

  // Verify CSRF state cookie
  const cookieState = request.cookies.get("linkedin_oauth_state")?.value;
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${appUrl}/settings?integration_error=invalid_state`);
  }

  let orgId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    orgId = decoded.orgId;
    if (!orgId) throw new Error("missing orgId");
    // Reject stale states (> 10 min)
    if (Date.now() - decoded.ts > 600_000) throw new Error("state expired");
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?integration_error=invalid_state`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${appUrl}/settings?integration_error=misconfigured`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code!,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/settings?integration_error=token_exchange_failed`);
  }

  const tokens = await tokenRes.json();
  const accessToken: string = tokens.access_token;
  const refreshToken: string | undefined = tokens.refresh_token;
  const expiresIn: number = tokens.expires_in ?? 5183944; // ~60 days

  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

  // Fetch org URN from LinkedIn
  let linkedinOrgUrn: string | undefined;
  try {
    const aclRes = await fetch(
      "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(id,localizedName)))",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (aclRes.ok) {
      const aclData = await aclRes.json();
      const firstOrg = aclData?.elements?.[0];
      if (firstOrg?.organization) {
        linkedinOrgUrn = `urn:li:organization:${firstOrg.organization.id}`;
      }
    }
  } catch {
    // Non-fatal — store integration without the URN; user can reconnect
  }

  await db.integration.upsert({
    where: { organizationId_platform: { organizationId: orgId, platform: "linkedin" } },
    create: {
      organizationId: orgId,
      platform: "linkedin",
      accessToken,
      refreshToken: refreshToken ?? null,
      tokenExpiresAt,
      externalId: linkedinOrgUrn ?? null,
      enabled: true,
    },
    update: {
      accessToken,
      refreshToken: refreshToken ?? null,
      tokenExpiresAt,
      externalId: linkedinOrgUrn ?? null,
      enabled: true,
    },
  });

  const response = NextResponse.redirect(`${appUrl}/settings?integration_connected=linkedin`);
  response.cookies.delete("linkedin_oauth_state");
  return response;
}
