import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getBlogPost, getAllBlogSlugs, blogPosts, type BlogSection } from "../posts";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — KiteHR Blog`,
    description: post.description,
  };
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return notFound();

  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      <article className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
              {post.category}
            </span>
            <span className="text-xs text-white/25">{post.readingTime}</span>
            <span className="text-xs text-white/25">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-white/50 leading-relaxed">{post.description}</p>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none">
          {post.content.map((section, i) => (
            <BlogSectionRenderer key={i} section={section} />
          ))}
        </div>
      </article>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">Start hiring with KiteHR — free</h2>
            <p className="text-white/40 mb-6 text-sm">
              Unlimited jobs, candidates, and users. No credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* More posts */}
      {otherPosts.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-lg font-semibold text-white mb-6">More from the blog</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-cyan-500/20 transition-all"
                >
                  <div className="text-xs text-white/30 mb-2">{p.category} · {p.readingTime}</div>
                  <h3 className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-2">{p.description}</p>
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
        <h2 className="text-xl font-bold text-white mt-10 mb-4">
          {section.content as string}
        </h2>
      );
    case "h3":
      return (
        <h3 className="text-lg font-semibold text-white mt-8 mb-3">
          {section.content as string}
        </h3>
      );
    case "p":
      return (
        <p className="text-white/55 leading-relaxed mb-4">
          {section.content as string}
        </p>
      );
    case "ul":
      return (
        <ul className="space-y-2 mb-4 pl-0 list-none">
          {(section.content as string[]).map((item, i) => (
            <li key={i} className="flex gap-2 items-start text-white/55 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/60" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-2 mb-4 pl-0 list-none">
          {(section.content as string[]).map((item, i) => (
            <li key={i} className="flex gap-3 items-start text-white/55 text-sm">
              <span className="shrink-0 text-cyan-500/60 font-semibold">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      );
    default:
      return null;
  }
}
