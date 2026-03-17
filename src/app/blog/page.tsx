import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { blogPosts } from "./posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — KiteHR",
  description:
    "Hiring guides, ATS tips, and recruiting best practices from the KiteHR team.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Hiring resources
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Guides, tips, and best practices for building great teams.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-8 pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-4">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                        {post.category}
                      </span>
                      <span className="text-xs text-white/25">{post.readingTime}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-white/40 leading-relaxed">{post.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/20 shrink-0 mt-1 group-hover:text-cyan-400 transition-colors" />
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
