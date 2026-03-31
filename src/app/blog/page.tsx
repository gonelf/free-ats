import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { blogPosts, type BlogPost } from "./posts";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — KiteHR",
  description:
    "Hiring guides, ATS tips, and recruiting best practices from the KiteHR team.",
  alternates: {
    types: {
      "application/rss+xml": "https://kitehr.co/blog/feed.xml",
    },
  },
};

export default async function BlogPage() {
  const dbPosts = await db.generatedBlogPost.findMany({
    orderBy: { planDay: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,
      category: true,
      readingTime: true,
      publishedAt: true,
    },
  });

  const generatedPosts: BlogPost[] = dbPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    publishedAt: p.publishedAt.toISOString().split("T")[0],
    readingTime: p.readingTime,
    category: p.category,
    content: [],
  }));

  const postMap = new Map<string, BlogPost>();
  for (const post of [...blogPosts, ...generatedPosts]) {
    postMap.set(post.slug, post);
  }
  const allPosts = Array.from(postMap.values());

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <h1 className="font-heading font-black tracking-tight text-slate-900 text-4xl md:text-5xl mb-4">
            Hiring resources
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Guides, tips, and best practices for building great teams.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-8 pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-4">
            {allPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-500">
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-400">{post.readingTime}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed">{post.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 shrink-0 mt-1 group-hover:text-teal-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
