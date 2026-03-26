"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { notifyUrlUpdated } from "@/lib/google-indexing";
import { createClient } from "@/lib/supabase/server";

export async function submitUrlsForIndexing(urls: string[]) {
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const submittedBy = user?.email ?? "admin";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const results = [];

  for (const url of urls) {
    const fullUrl = url.startsWith("http") ? url : `${appUrl}${url}`;
    const result = await notifyUrlUpdated(fullUrl);

    await db.googleIndexingLog.create({
      data: {
        url: fullUrl,
        type: result.type,
        status: result.status,
        httpStatus: result.httpStatus,
        response: result.response ?? undefined,
        errorMessage: result.errorMessage,
        submittedBy,
      },
    });

    results.push(result);
  }

  return results;
}

export async function getIndexingPages() {
  await requireAdmin();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Static blog pages
  const { blogPosts } = await import("@/app/blog/posts");
  const staticBlogPages = blogPosts.map((p) => ({
    url: `${appUrl}/blog/${p.slug}`,
    label: p.title,
    group: "Blog (static)",
  }));

  // Generated blog pages from DB
  const generatedPosts = await db.generatedBlogPost.findMany({
    select: { slug: true, title: true },
    orderBy: { publishedAt: "desc" },
  });
  const generatedBlogPages = generatedPosts.map((p) => ({
    url: `${appUrl}/blog/${p.slug}`,
    label: p.title,
    group: "Blog (generated)",
  }));

  // Salary hub pages
  const salaryHubPages = [
    { url: `${appUrl}/salaries`, label: "Salary Guide Hub", group: "Salary hubs" },
  ];

  // Published salary entries — city hubs, role hubs, detail pages
  const entries = await db.salaryEntry.findMany({
    where: { publishedAt: { not: null } },
    select: { citySlug: true, roleSlug: true, cityName: true, roleName: true },
    orderBy: [{ citySlug: "asc" }, { roleSlug: "asc" }],
  });

  // Deduplicate city and role hubs
  const citySeen = new Set<string>();
  const roleSeen = new Set<string>();
  const cityHubPages: { url: string; label: string; group: string }[] = [];
  const roleHubPages: { url: string; label: string; group: string }[] = [];
  const detailPages: { url: string; label: string; group: string }[] = [];

  for (const e of entries) {
    if (!citySeen.has(e.citySlug)) {
      citySeen.add(e.citySlug);
      cityHubPages.push({
        url: `${appUrl}/salaries/${e.citySlug}`,
        label: e.cityName,
        group: "Salary city hubs",
      });
    }
    if (!roleSeen.has(e.roleSlug)) {
      roleSeen.add(e.roleSlug);
      roleHubPages.push({
        url: `${appUrl}/salaries/roles/${e.roleSlug}`,
        label: e.roleName,
        group: "Salary role hubs",
      });
    }
    detailPages.push({
      url: `${appUrl}/salaries/${e.citySlug}/${e.roleSlug}`,
      label: `${e.roleName} in ${e.cityName}`,
      group: "Salary detail pages",
    });
  }

  return [
    ...staticBlogPages,
    ...generatedBlogPages,
    ...salaryHubPages,
    ...cityHubPages,
    ...roleHubPages,
    ...detailPages,
  ];
}

export async function getIndexingLogs() {
  await requireAdmin();

  return db.googleIndexingLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
