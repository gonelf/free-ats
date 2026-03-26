import { db } from "@/lib/db";
import type { Integration, Job, Organization } from "@prisma/client";

type JobWithOrg = Job & { organization: Organization };

// Shared shape accepted by both Integration (client orgs) and
// PlatformIntegration (KiteHR's own connections).
export interface LinkedInTokenHolder {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  externalId: string | null;
}

async function refreshLinkedInToken(
  integration: LinkedInTokenHolder,
  isPlatform: boolean
): Promise<LinkedInTokenHolder> {
  if (!integration.refreshToken) throw new Error("No refresh token");

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: integration.refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);

  const tokens = await res.json();
  const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in ?? 5183944) * 1000);
  const data = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? integration.refreshToken,
    tokenExpiresAt,
  };

  if (isPlatform) {
    return db.platformIntegration.update({ where: { id: integration.id }, data });
  }
  return db.integration.update({ where: { id: integration.id }, data });
}

async function getValidToken(
  integration: LinkedInTokenHolder,
  isPlatform = false
): Promise<string> {
  const fiveMinutes = 5 * 60 * 1000;
  const expiresSoon =
    integration.tokenExpiresAt &&
    integration.tokenExpiresAt.getTime() - Date.now() < fiveMinutes;

  if (expiresSoon && integration.refreshToken) {
    const refreshed = await refreshLinkedInToken(integration, isPlatform);
    return refreshed.accessToken!;
  }

  return integration.accessToken!;
}

export async function postJobToLinkedIn(
  integration: Integration,
  job: JobWithOrg
): Promise<string> {
  const token = await getValidToken(integration, false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const applyUrl = `${appUrl}/${job.organization.slug}/jobs/${job.slug ?? job.id}`;

  const body: Record<string, unknown> = {
    externalJobPostingId: job.id,
    title: job.title,
    description: { text: [job.description, job.requirements].filter(Boolean).join("\n\n") },
    employmentStatus: "FULL_TIME",
    workplaceTypes: job.location?.toLowerCase().includes("remote")
      ? ["REMOTE"]
      : ["ON_SITE"],
    listedAt: Date.now(),
    applyMethod: {
      "com.linkedin.jobs.OffSiteApply": { companyApplyUrl: applyUrl },
    },
    integrationContext: `urn:li:organization:${integration.externalId?.replace("urn:li:organization:", "") ?? ""}`,
    jobPostingOperationType: "CREATE",
    companyApplyUrl: applyUrl,
  };

  if (job.location) {
    body.formattedLocation = job.location;
  }

  if (job.salaryMin || job.salaryMax) {
    body.salary = {
      currency: "USD",
      ...(job.salaryMin ? { minimumSalary: job.salaryMin } : {}),
      ...(job.salaryMax ? { maximumSalary: job.salaryMax } : {}),
      period: "YEARLY",
    };
  }

  const res = await fetch("https://api.linkedin.com/v2/jobPostings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`LinkedIn API error ${res.status}: ${text}`);
  }

  // LinkedIn returns the created resource URN in the X-RestLi-Id header
  const urn = res.headers.get("x-restli-id") ?? res.headers.get("X-RestLi-Id") ?? "";
  return urn;
}

export async function postBlogPostToLinkedIn(
  integration: LinkedInTokenHolder,
  text: string,
  blogTitle: string,
  blogDescription: string,
  blogSlug: string
): Promise<string> {
  const token = await getValidToken(integration, true);
  const orgId = integration.externalId?.replace("urn:li:organization:", "") ?? "";
  const orgUrn = `urn:li:organization:${orgId}`;
  const blogUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://kitehr.com"}/blog/${blogSlug}`;

  const body = {
    author: orgUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            description: { text: blogDescription },
            originalUrl: blogUrl,
            title: { text: blogTitle },
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`LinkedIn ugcPost error ${res.status}: ${errText}`);
  }

  return res.headers.get("x-restli-id") ?? "";
}

export async function commentOnLinkedInPost(
  integration: LinkedInTokenHolder,
  postUrn: string,
  commentText: string
): Promise<void> {
  const token = await getValidToken(integration, true);
  const orgId = integration.externalId?.replace("urn:li:organization:", "") ?? "";
  const orgUrn = `urn:li:organization:${orgId}`;

  const encodedUrn = encodeURIComponent(postUrn);
  const res = await fetch(
    `https://api.linkedin.com/v2/socialActions/${encodedUrn}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        actor: orgUrn,
        message: { text: commentText },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`LinkedIn comment error ${res.status}: ${errText}`);
  }
}

export async function closeJobOnLinkedIn(
  integration: Integration,
  externalJobId: string
): Promise<void> {
  const token = await getValidToken(integration);

  const res = await fetch(
    `https://api.linkedin.com/v2/jobPostings/${encodeURIComponent(externalJobId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "X-RestLi-Method": "PARTIAL_UPDATE",
      },
      body: JSON.stringify({ patch: { "$set": { lifecycleState: "CLOSED" } } }),
    }
  );

  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`LinkedIn close error ${res.status}: ${text}`);
  }
}
