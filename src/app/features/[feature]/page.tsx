import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getFeature, getAllFeatureSlugs, featuresData } from "../features-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ feature: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { feature: slug } = await params;
  const data = getFeature(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `/features/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllFeatureSlugs().map((slug) => ({ feature: slug }));
}

export default async function FeaturePage({ params }: Props) {
  const { feature: slug } = await params;
  const data = getFeature(slug);
  if (!data) return notFound();

  const relatedFeatures = data.relatedFeatures
    .map((s) => featuresData[s])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium mb-6 ${
            data.plan === "pro"
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}>
            {data.plan === "pro" ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Pro feature — $49/mo
              </>
            ) : (
              "Free forever"
            )}
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-5 tracking-tight text-slate-900">{data.name}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {data.tagline}
          </p>
          <p className="text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            {data.description}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-colors"
            >
              Try it free
              <ArrowRight className="h-4 w-4" />
            </Link>
            {data.plan === "pro" && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                View Pro pricing
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">Why teams love it</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-200 transition-colors"
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

      {/* How it works */}
      <section className="py-20 border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">How it works</h2>
          <ol className="space-y-4">
            {data.howItWorks.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-sm font-bold mt-0.5 border border-teal-100">
                  {i + 1}
                </div>
                <p className="text-slate-600 leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Related features */}
      {relatedFeatures.length > 0 && (
        <section className="py-20 border-b border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Related features</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedFeatures.map((f) => (
                <Link
                  key={f.slug}
                  href={`/features/${f.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-200 hover:shadow-sm transition-all group"
                >
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium mb-3 ${
                    f.plan === "pro"
                      ? "border-teal-200 bg-teal-50 text-teal-700"
                      : "border-green-200 bg-green-50 text-green-700"
                  }`}>
                    {f.plan === "pro" ? "Pro" : "Free"}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-teal-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {data.plan === "pro" ? "Unlock " + data.name + " with Pro" : "Start using " + data.name + " for free"}
          </h2>
          <p className="text-teal-200 mb-8">
            {data.plan === "pro"
              ? "Start with the free plan and upgrade to Pro anytime. No credit card required to start."
              : "Unlimited everything. No credit card. No contracts."}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-teal-700 hover:bg-teal-50 transition-colors"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-teal-300">No credit card required</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
