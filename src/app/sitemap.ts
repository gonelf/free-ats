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
  ];
}
