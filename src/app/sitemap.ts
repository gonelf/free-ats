import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = "https://kitehr.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const jobs = await db.job.findMany({
    where: {
      status: "OPEN",
      slug: { not: null },
    },
    select: {
      slug: true,
      updatedAt: true,
      organization: {
        select: { slug: true },
      },
    },
  });

  const jobRoutes: MetadataRoute.Sitemap = jobs
    .filter((job) => job.slug && job.organization.slug)
    .map((job) => ({
      url: `${BASE_URL}/${job.organization.slug}/jobs/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  return [...staticRoutes, ...jobRoutes];
}
