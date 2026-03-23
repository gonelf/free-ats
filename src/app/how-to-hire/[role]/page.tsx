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
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/how-to-hire"
            className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All hiring playbooks
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              {data.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            How to Hire a {data.title}
          </h1>
          <p className="text-base text-white/50 max-w-2xl leading-relaxed mb-6">{data.intro}</p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <DollarSign className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-xs text-white/30">Typical Salary</div>
                <div className="text-sm font-semibold text-white">{formattedSalary}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <Clock className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-xs text-white/30">Time to Hire</div>
                <div className="text-sm font-semibold text-white">{data.timeToHire}</div>
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Set up a {data.title} hiring pipeline for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* Hiring steps */}
              <div>
                <h2 className="text-xl font-bold mb-6">Hiring Process</h2>
                <div className="space-y-4">
                  {data.hiringSteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 flex-1">
                        <h3 className="text-sm font-semibold text-white mb-2">{step.step}</h3>
                        <p className="text-xs text-white/50 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Where to post */}
              <div>
                <h2 className="text-xl font-bold mb-4">Where to Find {data.title}s</h2>
                <div className="space-y-3">
                  {data.whereToPost.map((platform, i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-4 flex gap-3">
                      <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-white">{platform.platform}</span>
                        <p className="text-xs text-white/40 leading-relaxed mt-1">{platform.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common mistakes */}
              <div>
                <h2 className="text-xl font-bold mb-4">Common Hiring Mistakes</h2>
                <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
                  <ul className="space-y-3">
                    {data.commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <AlertTriangle className="h-4 w-4 text-red-400/60 shrink-0 mt-0.5" />
                        <span className="text-sm text-white/55 leading-relaxed">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Top skills */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Top Skills to Assess</h3>
                <div className="space-y-2">
                  {data.topSkills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/50 shrink-0" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-2">Compensation Guide</h3>
                <p className="text-xl font-bold text-cyan-400 mb-1">{formattedSalary}</p>
                <p className="text-xs text-white/30 leading-relaxed">{data.salaryRange.note}</p>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-cyan-300">Ready to start?</h3>
                </div>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Set up a custom {data.title} hiring pipeline in KiteHR. Track every candidate from application to offer — completely free.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors w-full"
                >
                  Create free account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Related resources */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Related Resources</h3>
                <div className="space-y-2">
                  <Link
                    href={`/job-descriptions/${slug}`}
                    className="flex items-center justify-between gap-2 text-xs text-white/40 hover:text-cyan-400 transition-colors py-1"
                  >
                    <span>{data.title} Job Description Template</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                  </Link>
                  <Link
                    href={`/interview-questions/${slug}`}
                    className="flex items-center justify-between gap-2 text-xs text-white/40 hover:text-cyan-400 transition-colors py-1"
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
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">
              Set up your {data.title} hiring pipeline in 2 minutes
            </h2>
            <p className="text-white/40 mb-6 text-sm max-w-lg mx-auto">
              KiteHR gives you a custom pipeline, unlimited candidates, AI-assisted tools, and collaborative scoring — all for free. No credit card. No contracts.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Start hiring for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
