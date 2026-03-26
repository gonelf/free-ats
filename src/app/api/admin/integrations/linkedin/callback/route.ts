import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/admin?linkedin_error=${encodeURIComponent(error)}`
    );
  }

  const cookieState = request.cookies.get("linkedin_admin_oauth_state")?.value;
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${appUrl}/admin?linkedin_error=invalid_state`);
  }

  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    if (decoded.platform !== "linkedin_blog") throw new Error("unexpected platform");
    if (Date.now() - decoded.ts > 600_000) throw new Error("state expired");
  } catch {
    return NextResponse.redirect(`${appUrl}/admin?linkedin_error=invalid_state`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_ADMIN_REDIRECT_URI ?? process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${appUrl}/admin?linkedin_error=misconfigured`);
  }

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
    return NextResponse.redirect(`${appUrl}/admin?linkedin_error=token_exchange_failed`);
  }

  const tokens = await tokenRes.json();
  const accessToken: string = tokens.access_token;
  const refreshToken: string | undefined = tokens.refresh_token;
  const expiresIn: number = tokens.expires_in ?? 5183944;
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

  // Fetch the LinkedIn organization URN for the authenticated user
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
    // Non-fatal — admin can reconnect
  }

  await db.platformIntegration.upsert({
    where: { platform: "linkedin_blog" },
    create: {
      platform: "linkedin_blog",
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

  const response = NextResponse.redirect(`${appUrl}/admin?linkedin_connected=1`);
  response.cookies.delete("linkedin_admin_oauth_state");
  return response;
}
