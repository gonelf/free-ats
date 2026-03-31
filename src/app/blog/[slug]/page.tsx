import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getBlogPost, blogPosts, type BlogPost, type BlogSection } from "../posts";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

async function resolvePost(slug: string): Promise<BlogPost | null> {
  const staticPost = getBlogPost(slug);
  if (staticPost) return staticPost;

  const dbPost = await db.generatedBlogPost.findUnique({ where: { slug } });
  if (!dbPost) return null;

  return {
    slug: dbPost.slug,
    title: dbPost.title,
    description: dbPost.description,
    publishedAt: dbPost.publishedAt.toISOString().split("T")[0],
    readingTime: dbPost.readingTime,
    category: dbPost.category,
    content: dbPost.content as BlogSection[],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — KiteHR Blog`,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) return notFound();

  const dbOtherPosts = await db.generatedBlogPost.findMany({
    where: { slug: { not: slug } },
    orderBy: { planDay: "asc" },
    take: 2,
    select: { slug: true, title: true, description: true, category: true, readingTime: true },
  });

  const staticOtherPosts = blogPosts
    .filter((p) => p.slug !== slug)
    .map((p) => ({ slug: p.slug, title: p.title, description: p.description, category: p.category, readingTime: p.readingTime }));

  const otherPosts = [...staticOtherPosts, ...dbOtherPosts].slice(0, 2);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      <article className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-500">
              {post.category}
            </span>
            <span className="text-xs text-slate-400">{post.readingTime}</span>
            <span className="text-xs text-slate-400">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl leading-tight text-slate-900 mb-4">{post.title}</h1>
          <p className="text-lg text-slate-500 leading-relaxed">{post.description}</p>
        </header>

        {/* Content */}
        <div className="prose prose-slate prose-sm max-w-none">
          {post.content.map((section, i) => (
            <BlogSectionRenderer key={i} section={section} />
          ))}
        </div>
      </article>

      {/* CTA */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">
            Start hiring with KiteHR — free
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            Unlimited jobs, candidates, and users. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* More posts */}
      {otherPosts.length > 0 && (
        <section className="py-16 border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">More from the blog</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-200 hover:shadow-sm transition-all"
                >
                  <div className="text-xs text-slate-400 mb-2">{p.category} · {p.readingTime}</div>
                  <h3 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter />
    </div>
  );
}

function BlogSectionRenderer({ section }: { section: BlogSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 className="font-heading text-xl font-bold text-slate-900 mt-10 mb-4">
          {section.content as string}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-heading text-lg font-semibold text-slate-900 mt-8 mb-3">
          {section.content as string}
        </h3>
      );
    case "p":
      return (
        <p className="text-slate-600 leading-relaxed mb-4">
          {section.content as string}
        </p>
      );
    case "ul":
      return (
        <ul className="space-y-2 mb-4 pl-0 list-none">
          {(section.content as string[]).map((item, i) => (
            <li key={i} className="flex gap-2 items-start text-slate-600 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-2 mb-4 pl-0 list-none">
          {(section.content as string[]).map((item, i) => (
            <li key={i} className="flex gap-3 items-start text-slate-600 text-sm">
              <span className="shrink-0 text-teal-600 font-semibold">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      );
    default:
      return null;
  }
}
