import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getAllCompetitorSlugs } from "./vs/competitors";
import { getAllFeatureSlugs } from "./features/features-data";
import { getAllSegmentSlugs } from "./for/segments-data";
import { getAllBlogSlugs, blogPosts } from "./blog/posts";
import { getAllJobDescriptionSlugs } from "./job-descriptions/job-descriptions-data";
import { getAllInterviewQuestionsSlugs } from "./interview-questions/interview-questions-data";
import { getAllHowToHireSlugs } from "./how-to-hire/how-to-hire-data";
import { getAllHrEmailTemplateSlugs } from "./hr-email-templates/hr-email-templates-data";
import { SALARY_CITIES } from "./salaries/salary-data";
import { getAllAlternativeSlugs } from "./alternatives/alternatives-data";

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

  const alternativesRoutes: MetadataRoute.Sitemap = getAllAlternativeSlugs().map((slug) => ({
    url: `${BASE_URL}/alternatives/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

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

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
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
  // All salary routes are gated on publishedAt so the sitemap stays in sync
  // with what the pages actually serve. Wrapped in try/catch so a missing
  // SalaryEntry table (pre-migration) never crashes the sitemap build.
  const salaryIndexRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/salaries`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
  ];

  let salaryCityRoutes: MetadataRoute.Sitemap = [];
  let salaryRoleRoutes: MetadataRoute.Sitemap = [];
  let salaryLeafRoutes: MetadataRoute.Sitemap = [];

  try {
    const publishedSalaryEntries = await db.salaryEntry.findMany({
      where: { publishedAt: { not: null } },
      select: { citySlug: true, roleSlug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    // City hub pages — only cities that have at least one published entry
    const publishedCitySlugs = [...new Set(publishedSalaryEntries.map((e) => e.citySlug))];
    salaryCityRoutes = publishedCitySlugs.map((slug) => {
      const city = SALARY_CITIES.find((c) => c.slug === slug);
      const lastEntry = publishedSalaryEntries.find((e) => e.citySlug === slug);
      return {
        url: `${BASE_URL}/salaries/${slug}`,
        lastModified: lastEntry?.publishedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: city?.tier === 1 ? 0.85 : city?.tier === 2 ? 0.75 : 0.65,
      };
    });

    // Role hub pages — only roles that have at least one published entry
    const publishedRoleSlugs = [...new Set(publishedSalaryEntries.map((e) => e.roleSlug))];
    salaryRoleRoutes = publishedRoleSlugs.map((slug) => {
      const lastEntry = publishedSalaryEntries.find((e) => e.roleSlug === slug);
      return {
        url: `${BASE_URL}/salaries/roles/${slug}`,
        lastModified: lastEntry?.publishedAt ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });

    // Leaf pages — one per published (city, role) pair
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
    // Table not yet migrated — salary routes will be added to the sitemap
    // on the first successful build after `prisma migrate deploy` runs.
  }

  // ── SOP library ────────────────────────────────────────────────
  const hrSopIndexRoute: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/hr-sop`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];

  let hrSopRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedSops = await db.generatedSop.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    hrSopRoutes = publishedSops.map((sop) => ({
      url: `${BASE_URL}/hr-sop/${sop.slug}`,
      lastModified: sop.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // Table not yet migrated — SOP routes added on first build after migration
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
    ...alternativesRoutes,
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
    ...hrSopIndexRoute,
    ...hrSopRoutes,
    ...jobRoutes,
    ...salaryIndexRoute,
    ...salaryCityRoutes,
    ...salaryRoleRoutes,
    ...salaryLeafRoutes,
  ];
}
