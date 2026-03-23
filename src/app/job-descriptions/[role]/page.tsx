import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, Briefcase, DollarSign } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getJobDescriptionRole, getAllJobDescriptionSlugs } from "../job-descriptions-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ role: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: slug } = await params;
  const data = getJobDescriptionRole(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `/job-descriptions/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllJobDescriptionSlugs().map((slug) => ({ role: slug }));
}

export default async function JobDescriptionPage({ params }: Props) {
  const { role: slug } = await params;
  const data = getJobDescriptionRole(slug);
  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/job-descriptions"
            className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All job description templates
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              <Briefcase className="h-3 w-3" />
              {data.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">
              <DollarSign className="h-3 w-3" />
              {data.salaryRange}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {data.title} Job Description Template
          </h1>
          <p className="text-base text-white/50 max-w-2xl leading-relaxed mb-8">
            {data.overview}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Post this job for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features/ai-job-description-generator"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Generate a custom JD with AI
            </Link>
          </div>
        </div>
      </section>

      {/* Template */}
      <section className="py-10 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main template */}
            <div className="lg:col-span-2 space-y-6">
              {/* Responsibilities */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h2 className="text-base font-semibold text-white mb-4">Responsibilities</h2>
                <ul className="space-y-2.5">
                  {data.responsibilities.map((item, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-white/60">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h2 className="text-base font-semibold text-white mb-4">Requirements</h2>
                <ul className="space-y-2.5">
                  {data.requirements.map((item, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-white/60">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nice to have */}
              {data.niceToHave.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <h2 className="text-base font-semibold text-white mb-4">Nice to Have</h2>
                  <ul className="space-y-2.5">
                    {data.niceToHave.map((item, i) => (
                      <li key={i} className="flex gap-2.5 items-start text-sm text-white/60">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Skills */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-xs text-cyan-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-2">Typical Salary Range</h3>
                <p className="text-lg font-bold text-cyan-400">{data.salaryRange}</p>
                <p className="text-xs text-white/30 mt-1">Varies by location and experience</p>
              </div>

              {/* AI CTA */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-cyan-300">Want a custom JD?</h3>
                </div>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  This template is a starting point. Use KiteHR&apos;s AI to generate a job description tailored to your
                  company, tone, and specific requirements in seconds.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors w-full"
                >
                  Try AI Job Description Generator
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Ready to hire your {data.title}?
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Post this role and track applicants for free
            </h2>
            <p className="text-white/40 mb-6 text-sm max-w-lg mx-auto">
              KiteHR gives you unlimited jobs, unlimited candidates, and AI-powered hiring tools — completely free.
              No credit card. No contracts.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Post this job for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/job-descriptions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white/60 hover:bg-white/10 transition-colors"
              >
                Browse more templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
