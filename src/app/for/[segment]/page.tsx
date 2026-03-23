import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight, X, Infinity } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getSegment, getAllSegmentSlugs } from "../segments-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ segment: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment: slug } = await params;
  const data = getSegment(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `/for/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllSegmentSlugs().map((slug) => ({ segment: slug }));
}

export default async function SegmentPage({ params }: Props) {
  const { segment: slug } = await params;
  const data = getSegment(slug);
  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 mb-6">
            <Infinity className="h-3.5 w-3.5" />
            Built for {data.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight leading-tight">
            {data.headline}
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-5 leading-relaxed">
            {data.subheadline}
          </p>
          <p className="text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            {data.description}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white/80 hover:bg-white/10 transition-colors"
            >
              View pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/25">No credit card required · Free forever</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            The ATS problems {data.name.toLowerCase()} face
          </h2>
          <p className="text-white/40 text-center mb-10 max-w-xl mx-auto">
            Most hiring tools weren&apos;t built with your needs in mind. KiteHR is different.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.painPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 mb-4">
                  <X className="h-4 w-4 text-red-400/70" />
                </div>
                <h3 className="font-semibold text-white mb-2">{point.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            How KiteHR works for {data.name.toLowerCase()}
          </h2>
          <p className="text-white/40 text-center mb-10 max-w-xl mx-auto">
            Everything you need. None of the overhead.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
                  <Check className="h-4 w-4 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/5 to-white/2 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/8 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400 mb-5">
                  FREE FOREVER
                </div>
                <h2 className="text-2xl font-bold mb-3">Start free, scale when ready</h2>
                <p className="text-white/40 leading-relaxed mb-6">
                  KiteHR&apos;s core ATS is free with no limits. When you&apos;re ready for AI features, upgrade to Pro for $49/mo — per workspace, not per seat.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  "Unlimited users",
                  "Unlimited job posts",
                  "Unlimited candidates",
                  "Kanban pipeline",
                  "Team collaboration",
                  "Email templates",
                  "No credit card required",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">
              Ready to simplify hiring for your {data.name.toLowerCase()}?
            </h2>
            <p className="text-white/40 mb-8">
              Create your free account and start posting jobs in minutes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-white/25">No credit card required · Unlimited everything</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
