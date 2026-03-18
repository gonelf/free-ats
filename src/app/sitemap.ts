import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getAllCompetitorSlugs } from "./vs/competitors";
import { getAllFeatureSlugs } from "./features/features-data";
import { getAllSegmentSlugs } from "./for/segments-data";
import { getAllBlogSlugs } from "./blog/posts";
import { getAllJobDescriptionSlugs } from "./job-descriptions/job-descriptions-data";
import { getAllInterviewQuestionsSlugs } from "./interview-questions/interview-questions-data";
import { getAllHowToHireSlugs } from "./how-to-hire/how-to-hire-data";
import { getAllHrEmailTemplateSlugs } from "./hr-email-templates/hr-email-templates-data";
import { SALARY_CITIES, getAllRoleSlugs } from "./salaries/salary-data";

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
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
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

  const vsRoutes: MetadataRoute.Sitemap = getAllCompetitorSlugs().map((slug) => ({
    url: `${BASE_URL}/vs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const featureRoutes: MetadataRoute.Sitemap = getAllFeatureSlugs().map((slug) => ({
    url: `${BASE_URL}/features/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const forRoutes: MetadataRoute.Sitemap = getAllSegmentSlugs().map((slug) => ({
    url: `${BASE_URL}/for/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const jobDescriptionIndexRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/job-descriptions`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];
  const jobDescriptionRoutes: MetadataRoute.Sitemap = getAllJobDescriptionSlugs().map((slug) => ({
    url: `${BASE_URL}/job-descriptions/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const interviewQuestionsIndexRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/interview-questions`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];
  const interviewQuestionsRoutes: MetadataRoute.Sitemap = getAllInterviewQuestionsSlugs().map((slug) => ({
    url: `${BASE_URL}/interview-questions/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const howToHireIndexRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/how-to-hire`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];
  const howToHireRoutes: MetadataRoute.Sitemap = getAllHowToHireSlugs().map((slug) => ({
    url: `${BASE_URL}/how-to-hire/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const hrEmailTemplatesIndexRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/hr-email-templates`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];
  const hrEmailTemplatesRoutes: MetadataRoute.Sitemap = getAllHrEmailTemplateSlugs().map((slug) => ({
    url: `${BASE_URL}/hr-email-templates/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // ── Salary directory ───────────────────────────────────────────
  // Index + all city hubs (always present regardless of publishedAt)
  const salaryIndexRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/salaries`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
  ];

  const salaryCityRoutes: MetadataRoute.Sitemap = SALARY_CITIES.map((city) => ({
    url: `${BASE_URL}/salaries/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: city.tier === 1 ? 0.85 : city.tier === 2 ? 0.75 : 0.65,
  }));

  // Role hub pages
  const salaryRoleRoutes: MetadataRoute.Sitemap = getAllRoleSlugs().map((slug) => ({
    url: `${BASE_URL}/salaries/roles/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Leaf pages — only published entries (publishedAt IS NOT NULL)
  // Wrapped in try/catch: the SalaryEntry table may not exist yet if the
  // migration hasn't been applied, and we must not crash the build.
  let salaryLeafRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedSalaryEntries = await db.salaryEntry.findMany({
      where: { publishedAt: { not: null } },
      select: { citySlug: true, roleSlug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    salaryLeafRoutes = publishedSalaryEntries.map((entry) => {
      const city = SALARY_CITIES.find((c) => c.slug === entry.citySlug);
      return {
        url: `${BASE_URL}/salaries/${entry.citySlug}/${entry.roleSlug}`,
        lastModified: entry.publishedAt ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: city?.tier === 1 ? 0.80 : city?.tier === 2 ? 0.70 : 0.60,
      };
    });
  } catch {
    // Table not yet migrated — leaf pages will be added to the sitemap
    // on the first successful build after `prisma migrate deploy` runs.
  }

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

  return [
    ...staticRoutes,
    ...vsRoutes,
    ...featureRoutes,
    ...forRoutes,
    ...blogRoutes,
    ...jobDescriptionIndexRoute,
    ...jobDescriptionRoutes,
    ...interviewQuestionsIndexRoute,
    ...interviewQuestionsRoutes,
    ...howToHireIndexRoute,
    ...howToHireRoutes,
    ...hrEmailTemplatesIndexRoute,
    ...hrEmailTemplatesRoutes,
    ...jobRoutes,
    ...salaryIndexRoute,
    ...salaryCityRoutes,
    ...salaryRoleRoutes,
    ...salaryLeafRoutes,
  ];
}
