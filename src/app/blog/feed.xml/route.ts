import { NextResponse } from "next/server";
import { blogPosts, type BlogSection } from "../posts";

const BASE_URL = "https://kitehr.co";
const FEED_TITLE = "KiteHR Blog";
const FEED_DESCRIPTION =
  "Hiring tips, recruiting best practices, and ATS guides for small businesses and startups.";

function sectionsToHtml(sections: BlogSection[]): string {
  return sections
    .map((s) => {
      if (s.type === "h2") return `<h2>${escape(s.content as string)}</h2>`;
      if (s.type === "h3") return `<h3>${escape(s.content as string)}</h3>`;
      if (s.type === "p") return `<p>${escape(s.content as string)}</p>`;
      if (s.type === "ul") {
        const items = (s.content as string[])
          .map((li) => `<li>${escape(li)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      if (s.type === "ol") {
        const items = (s.content as string[])
          .map((li) => `<li>${escape(li)}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }
      return "";
    })
    .join("\n");
}

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cdata(str: string): string {
  return `<![CDATA[${str}]]>`;
}

export async function GET() {
  const sorted = [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const lastBuildDate = sorted[0]
    ? new Date(sorted[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const items = sorted
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      const html = sectionsToHtml(post.content);

      return `
    <item>
      <title>${cdata(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${cdata(post.description)}</description>
      <content:encoded>${cdata(html)}</content:encoded>
      <pubDate>${pubDate}</pubDate>
      <category>${cdata(post.category)}</category>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${cdata(FEED_TITLE)}</title>
    <link>${BASE_URL}/blog</link>
    <description>${cdata(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
