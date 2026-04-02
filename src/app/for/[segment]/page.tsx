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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
            <Infinity className="h-3.5 w-3.5" />
            Built for {data.name}
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-5 tracking-tight leading-tight text-slate-900">
            {data.headline}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-5 leading-relaxed">
            {data.subheadline}
          </p>
          <p className="text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            {data.description}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-colors"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">No credit card required · Free forever</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
            The ATS problems {data.name.toLowerCase()} face
          </h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Most hiring tools weren&apos;t built with your needs in mind. KiteHR is different.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.painPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 mb-4">
                  <X className="h-4 w-4 text-red-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{point.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
            How KiteHR works for {data.name.toLowerCase()}
          </h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Everything you need. None of the overhead.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-200 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 mb-4">
                  <Check className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="py-20 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 mb-5">
                  FREE FOREVER
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Start free, scale when ready</h2>
                <p className="text-slate-500 leading-relaxed mb-6">
                  KiteHR&apos;s core ATS is free with no limits. When you&apos;re ready for AI features, upgrade to Pro for $49/mo — per workspace, not per seat.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
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
                  <div key={f} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3 w-3 text-green-700" />
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
      <section className="py-24 bg-teal-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to simplify hiring for your {data.name.toLowerCase()}?
          </h2>
          <p className="text-teal-200 mb-8">
            Create your free account and start posting jobs in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-teal-700 hover:bg-teal-50 transition-colors"
          >
            Create your free account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-teal-300">No credit card required · Unlimited everything</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
