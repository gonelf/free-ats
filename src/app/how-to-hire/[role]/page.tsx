import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getHowToHireRole, getAllHowToHireSlugs } from "../how-to-hire-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ role: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: slug } = await params;
  const data = getHowToHireRole(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `/how-to-hire/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllHowToHireSlugs().map((slug) => ({ role: slug }));
}

export default async function HowToHirePage({ params }: Props) {
  const { role: slug } = await params;
  const data = getHowToHireRole(slug);
  if (!data) return notFound();

  const formattedSalary = `${data.salaryRange.currency === "USD" ? "$" : "£"}${data.salaryRange.min.toLocaleString()} – ${data.salaryRange.currency === "USD" ? "$" : "£"}${data.salaryRange.max.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/how-to-hire"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All hiring playbooks
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              {data.category}
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">
            How to Hire a {data.title}
          </h1>
          <p className="text-base text-slate-500 max-w-2xl leading-relaxed mb-6">{data.intro}</p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <DollarSign className="h-4 w-4 text-teal-600" />
              <div>
                <div className="text-xs text-slate-400">Typical Salary</div>
                <div className="text-sm font-semibold text-slate-900">{formattedSalary}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Clock className="h-4 w-4 text-teal-600" />
              <div>
                <div className="text-xs text-slate-400">Time to Hire</div>
                <div className="text-sm font-semibold text-slate-900">{data.timeToHire}</div>
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
          >
            Set up a {data.title} hiring pipeline for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* Hiring steps */}
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-6">Hiring Process</h2>
                <div className="space-y-4">
                  {data.hiringSteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-700 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">{step.step}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Where to post */}
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-4">Where to Find {data.title}s</h2>
                <div className="space-y-3">
                  {data.whereToPost.map((platform, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-3">
                      <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-slate-900">{platform.platform}</span>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{platform.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common mistakes */}
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-4">Common Hiring Mistakes</h2>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <ul className="space-y-3">
                    {data.commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 leading-relaxed">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Top skills */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Top Skills to Assess</h3>
                <div className="space-y-2">
                  {data.topSkills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Compensation Guide</h3>
                <p className="text-xl font-bold text-teal-700 mb-1">{formattedSalary}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{data.salaryRange.note}</p>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                  <h3 className="text-sm font-semibold text-teal-900">Ready to start?</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Set up a custom {data.title} hiring pipeline in KiteHR. Track every candidate from application to offer — completely free.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors w-full"
                >
                  Create free account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Related resources */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Related Resources</h3>
                <div className="space-y-2">
                  <Link
                    href={`/job-descriptions/${slug}`}
                    className="flex items-center justify-between gap-2 text-xs text-slate-500 hover:text-teal-700 transition-colors py-1"
                  >
                    <span>{data.title} Job Description Template</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                  </Link>
                  <Link
                    href={`/interview-questions/${slug}`}
                    className="flex items-center justify-between gap-2 text-xs text-slate-500 hover:text-teal-700 transition-colors py-1"
                  >
                    <span>{data.title} Interview Questions</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Set up your {data.title} hiring pipeline in 2 minutes
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            KiteHR gives you a custom pipeline, unlimited candidates, AI-assisted tools, and collaborative scoring — all for free. No credit card. No contracts.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Start hiring for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
