import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, FileText, Clock, Users, RefreshCw, Lock } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 86400; // 24-hour ISR

type Props = {
  params: Promise<{ slug: string }>;
};

type SopStep = {
  step: number;
  title: string;
  description: string;
  tips?: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  hiring: "Hiring Process",
  "hr-ops": "HR Operations",
  compliance: "Compliance",
  onboarding: "Onboarding",
  manager: "Manager & Team",
  benefits: "Benefits & Payroll",
  international: "International & Scaling",
};

const FREE_STEPS = 2; // number of steps shown before the gate

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let sop;
  try {
    sop = await db.generatedSop.findUnique({
      where: { slug },
      select: { metaTitle: true, metaDescription: true, publishedAt: true },
    });
  } catch {
    return {};
  }
  if (!sop || !sop.publishedAt) return {};
  return {
    title: sop.metaTitle,
    description: sop.metaDescription,
    alternates: { canonical: `/hr-sop/${slug}` },
  };
}

export async function generateStaticParams() {
  try {
    const sops = await db.generatedSop.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
    });
    return sops.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export default async function HrSopDetailPage({ params }: Props) {
  const { slug } = await params;

  let sop;
  try {
    sop = await db.generatedSop.findUnique({ where: { slug } });
  } catch {
    return notFound();
  }

  if (!sop || !sop.publishedAt) return notFound();

  const steps = sop.steps as SopStep[];
  const visibleSteps = steps.slice(0, FREE_STEPS);
  const lockedSteps = steps.slice(FREE_STEPS);
  const signupHref = `/signup?redirect=${encodeURIComponent(`/sop/${sop.slug}`)}`;

  // Fetch related SOPs
  let relatedSops: { slug: string; title: string }[] = [];
  if (sop.relatedSlugs.length > 0) {
    try {
      relatedSops = await db.generatedSop.findMany({
        where: {
          slug: { in: sop.relatedSlugs },
          publishedAt: { not: null },
        },
        select: { slug: true, title: true },
        take: 4,
      });
    } catch {
      // Non-fatal
    }
  }

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
            href="/hr-sop"
            className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All HR SOPs
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              <FileText className="h-3 w-3" />
              {CATEGORY_LABELS[sop.category] ?? sop.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{sop.title}</h1>
          <p className="text-base text-white/50 max-w-2xl leading-relaxed mb-6">
            {sop.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mb-8 text-xs text-white/30">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {sop.estimatedTime}
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              {sop.frequency}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {sop.responsibleRoles.join(", ")}
            </span>
          </div>

          <Link
            href={signupHref}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="h-4 w-4" />
            Use this SOP in KiteHR — free
          </Link>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Steps */}
            <div className="lg:col-span-2 space-y-4">
              <div className="mb-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Purpose
                </p>
                <p className="mt-1 text-sm text-white/60 leading-relaxed">{sop.purpose}</p>
              </div>
              <div className="mb-6">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Scope
                </p>
                <p className="mt-1 text-sm text-white/60 leading-relaxed">{sop.scope}</p>
              </div>

              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                Steps ({steps.length})
              </p>

              {/* Visible steps */}
              {visibleSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-2xl border border-white/8 bg-white/3 p-5"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-cyan-400">{step.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm mb-1">{step.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                      {step.tips && step.tips.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {step.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 items-start text-xs text-white/40">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/50" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Gate — locked steps + signup wall */}
              {lockedSteps.length > 0 && (
                <div className="relative">
                  {/* Blurred steps — still in HTML for SEO */}
                  <div className="space-y-4 select-none" aria-hidden="true">
                    {lockedSteps.map((step) => (
                      <div
                        key={step.step}
                        className="rounded-2xl border border-white/8 bg-white/3 p-5 blur-sm"
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-400">{step.step}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-sm mb-1">{step.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gradient fade + CTA overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080c10]/80 to-[#080c10]" />
                    <div className="relative z-10 flex flex-col items-center text-center px-6 py-8 mt-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 mb-4">
                        <Lock className="h-5 w-5 text-cyan-400" />
                      </div>
                      <p className="text-base font-semibold text-white mb-1">
                        {lockedSteps.length} more step{lockedSteps.length !== 1 ? "s" : ""} in this SOP
                      </p>
                      <p className="text-sm text-white/40 mb-5 max-w-xs">
                        Create a free KiteHR account to access the full process and keep your team aligned.
                      </p>
                      <Link
                        href={signupHref}
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                      >
                        <Sparkles className="h-4 w-4" />
                        Unlock all steps — free
                      </Link>
                      <p className="mt-3 text-xs text-white/25">
                        Already have an account?{" "}
                        <Link
                          href={`/login?redirectTo=${encodeURIComponent(`/sop/${sop.slug}`)}`}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick info */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Quick Reference</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Frequency</p>
                    <p className="text-xs text-white/70">{sop.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Time Required</p>
                    <p className="text-xs text-white/70">{sop.estimatedTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Responsible Roles</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {sop.responsibleRoles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-cyan-300">Use in KiteHR</h3>
                </div>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Access all 125+ HR SOPs inside your KiteHR account. Keep your team aligned on every process — completely free.
                </p>
                <Link
                  href={signupHref}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors w-full"
                >
                  Create free account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Related SOPs */}
              {relatedSops.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Related SOPs</h3>
                  <ul className="space-y-2">
                    {relatedSops.map((related) => (
                      <li key={related.slug}>
                        <Link
                          href={`/hr-sop/${related.slug}`}
                          className="flex items-center gap-2 text-xs text-white/50 hover:text-cyan-400 transition-colors group"
                        >
                          <ArrowRight className="h-3 w-3 shrink-0 text-white/20 group-hover:text-cyan-400 transition-colors" />
                          {related.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
              125+ SOPs in KiteHR
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Stop reinventing the wheel on every hire
            </h2>
            <p className="text-white/40 mb-6 text-sm max-w-lg mx-auto">
              KiteHR gives your team access to every SOP, hiring template, and email — all in one place. Free forever.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href={signupHref}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/hr-sop"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white/60 hover:bg-white/10 transition-colors"
              >
                Browse all SOPs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
