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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/job-descriptions"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All job description templates
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <Briefcase className="h-3 w-3" />
              {data.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              <DollarSign className="h-3 w-3" />
              {data.salaryRange}
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">
            {data.title} Job Description Template
          </h1>
          <p className="text-base text-slate-500 max-w-2xl leading-relaxed mb-8">
            {data.overview}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
            >
              Post this job for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features/ai-job-description-generator"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-teal-600" />
              Generate a custom JD with AI
            </Link>
          </div>
        </div>
      </section>

      {/* Template */}
      <section className="py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main template */}
            <div className="lg:col-span-2 space-y-6">
              {/* Responsibilities */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Responsibilities</h2>
                <ul className="space-y-2.5">
                  {data.responsibilities.map((item, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Requirements</h2>
                <ul className="space-y-2.5">
                  {data.requirements.map((item, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nice to have */}
              {data.niceToHave.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-base font-semibold text-slate-900 mb-4">Nice to Have</h2>
                  <ul className="space-y-2.5">
                    {data.niceToHave.map((item, i) => (
                      <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
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
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs text-teal-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Typical Salary Range</h3>
                <p className="text-lg font-bold text-teal-700">{data.salaryRange}</p>
                <p className="text-xs text-slate-400 mt-1">Varies by location and experience</p>
              </div>

              {/* AI CTA */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                  <h3 className="text-sm font-semibold text-teal-900">Want a custom JD?</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  This template is a starting point. Use KiteHR&apos;s AI to generate a job description tailored to your
                  company, tone, and specific requirements in seconds.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors w-full"
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
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600 bg-teal-600/50 px-4 py-1.5 text-sm text-teal-100 mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Ready to hire your {data.title}?
          </div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Post this role and track applicants for free
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            KiteHR gives you unlimited jobs, unlimited candidates, and AI-powered hiring tools — completely free.
            No credit card. No contracts.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
            >
              Post this job for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/job-descriptions"
              className="inline-flex items-center gap-2 rounded-xl border border-teal-600 px-7 py-3.5 text-sm font-bold text-teal-100 hover:bg-teal-600/50 transition-colors"
            >
              Browse more templates
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
