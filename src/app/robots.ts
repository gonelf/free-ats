import { MetadataRoute } from "next";

const BASE_URL = "https://kitehr.co";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/signup", "/login", "/vs/", "/features/", "/for/", "/faq", "/about", "/blog"],
        disallow: [
          "/jobs",
          "/candidates",
          "/pipelines",
          "/team",
          "/settings",
          "/reports",
          "/upgrade",
          "/email-templates",
          "/admin",
          "/api/",
          "/setup",
          "/invitations/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
