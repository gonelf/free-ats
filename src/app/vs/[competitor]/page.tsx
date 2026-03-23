import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight, Sparkles, Calculator } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getCompetitor, getAllCompetitorSlugs } from "../competitors";
import { CostCalculator } from "@/components/CostCalculator";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ competitor: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor: slug } = await params;
  const data = getCompetitor(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `/vs/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({ competitor: slug }));
}

export default async function CompetitorPage({ params }: Props) {
  const { competitor: slug } = await params;
  const data = getCompetitor(slug);
  if (!data) return notFound();

  // BambooHR uses per-employee pricing, so show the employees slider
  const showEmployees = data.pricingCalculator.perEmployeeCost > 0;

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
            KiteHR vs {data.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            A better alternative to{" "}
            <span className="text-white/40">{data.name}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed">
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

      {/* Pricing overview */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">KiteHR</div>
              <p className="text-white font-medium">{data.pricing.kitehr}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">{data.name}</div>
              <p className="text-white/60">{data.pricing.competitor}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cost calculator */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-4">
              <Calculator className="h-3.5 w-3.5" />
              Cost calculator
            </div>
            <h2 className="text-2xl font-bold mb-3">
              See exactly what you&apos;d save
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto">
              Adjust your team size and open roles to see a real cost comparison between KiteHR and {data.name}.
            </p>
          </div>
          <CostCalculator
            competitorName={data.name}
            config={data.pricingCalculator}
            showEmployees={showEmployees}
          />
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Feature comparison</h2>
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">
              <div>Feature</div>
              <div className="text-center text-cyan-400">KiteHR</div>
              <div className="text-center">{data.name}</div>
            </div>
            {/* Rows */}
            {data.features.map((feature, i) => (
              <div
                key={feature.label}
                className={`grid grid-cols-3 px-6 py-3.5 text-sm border-t border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}
              >
                <div className="text-white/70">{feature.label}</div>
                <div className="flex justify-center">
                  <FeatureCell value={feature.kitehr} highlight />
                </div>
                <div className="flex justify-center">
                  <FeatureCell value={feature.competitor} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why KiteHR wins */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center mb-10">
            Why teams choose KiteHR over {data.name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.winReasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-cyan-500/20 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
                  <Check className="h-4 w-4 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{reason.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{reason.description}</p>
              </div>
            ))}
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
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Switch from {data.name} today
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Start hiring free — no strings attached
            </h2>
            <p className="text-white/40 mb-8">
              Unlimited users, jobs, and candidates. No credit card. No contracts.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function FeatureCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${highlight ? "bg-green-500/15" : "bg-white/8"}`}>
        <Check className={`h-3.5 w-3.5 ${highlight ? "text-green-400" : "text-white/50"}`} />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
        <X className="h-3.5 w-3.5 text-red-400/60" />
      </div>
    );
  }
  // String value
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${highlight ? "bg-cyan-500/10 text-cyan-400" : "bg-white/8 text-white/50"}`}>
      {value}
    </span>
  );
}
