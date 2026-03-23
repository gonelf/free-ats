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
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-6 ${
            data.plan === "pro"
              ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
              : "border-green-500/20 bg-green-500/10 text-green-400"
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
          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">{data.name}</h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed">
            {data.tagline}
          </p>
          <p className="text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            {data.description}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Try it free
              <ArrowRight className="h-4 w-4" />
            </Link>
            {data.plan === "pro" && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                View Pro pricing
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Why teams love it</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-cyan-500/20 transition-colors"
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

      {/* How it works */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <ol className="space-y-4">
            {data.howItWorks.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-white/60 leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Related features */}
      {relatedFeatures.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-2xl font-bold text-center mb-10">Related features</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedFeatures.map((f) => (
                <Link
                  key={f.slug}
                  href={`/features/${f.slug}`}
                  className="rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs mb-3 ${
                    f.plan === "pro"
                      ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                      : "border-green-500/20 bg-green-500/10 text-green-400"
                  }`}>
                    {f.plan === "pro" ? "Pro" : "Free"}
                  </div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">{f.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">
              {data.plan === "pro" ? "Unlock " + data.name + " with Pro" : "Start using " + data.name + " for free"}
            </h2>
            <p className="text-white/40 mb-8">
              {data.plan === "pro"
                ? "Start with the free plan and upgrade to Pro anytime. No credit card required to start."
                : "Unlimited everything. No credit card. No contracts."}
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-white/25">No credit card required</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
