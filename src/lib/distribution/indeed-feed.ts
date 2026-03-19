import { db } from "@/lib/db";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generateIndeedFeed(organizationId: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const org = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { name: true, slug: true },
  });

  const jobs = await db.job.findMany({
    where: { organizationId, status: "OPEN" },
    select: {
      id: true,
      title: true,
      description: true,
      requirements: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      slug: true,
      createdAt: true,
    },
  });

  const jobXml = jobs
    .map((job) => {
      const applyUrl = `${appUrl}/${org.slug}/jobs/${job.slug ?? job.id}`;
      const datePosted = job.createdAt.toISOString().split("T")[0];
      const description = [job.description, job.requirements]
        .filter(Boolean)
        .join("\n\n");

      const salaryPart =
        job.salaryMin || job.salaryMax
          ? `<salary>${escapeXml(
              [
                job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : null,
                job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : null,
              ]
                .filter(Boolean)
                .join(" - ")
            )} per year</salary>`
          : "";

      return `
  <job>
    <title><![CDATA[${job.title}]]></title>
    <date>${escapeXml(datePosted)}</date>
    <referencenumber>${escapeXml(job.id)}</referencenumber>
    <url>${escapeXml(applyUrl)}</url>
    <company><![CDATA[${org.name}]]></company>
    ${job.location ? `<city><![CDATA[${job.location}]]></city>` : ""}
    <description><![CDATA[${description}]]></description>
    ${salaryPart}
    <jobtype>fulltime</jobtype>
  </job>`.trim();
    })
    .join("\n  ");

  return `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher>${escapeXml(org.name)}</publisher>
  <publisherurl>${escapeXml(`${appUrl}/${org.slug}`)}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${jobXml}
</source>`;
}
