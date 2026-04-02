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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6">
            KiteHR vs {data.name}
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-5 tracking-tight text-slate-900">
            A better alternative to{" "}
            <span className="text-slate-400">{data.name}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
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

      {/* Pricing overview */}
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-teal-600 bg-white p-6">
              <div className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">KiteHR</div>
              <p className="text-slate-900 font-medium">{data.pricing.kitehr}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{data.name}</div>
              <p className="text-slate-500">{data.pricing.competitor}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cost calculator */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-4">
              <Calculator className="h-3.5 w-3.5" />
              Cost calculator
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              See exactly what you&apos;d save
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
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
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Feature comparison</h2>
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
            {/* Header */}
            <div className="grid grid-cols-3 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-200">
              <div>Feature</div>
              <div className="text-center text-teal-700">KiteHR</div>
              <div className="text-center">{data.name}</div>
            </div>
            {/* Rows */}
            {data.features.map((feature, i) => (
              <div
                key={feature.label}
                className={`grid grid-cols-3 px-6 py-3.5 text-sm border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
              >
                <div className="text-slate-600">{feature.label}</div>
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
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            Why teams choose KiteHR over {data.name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.winReasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-200 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 mb-4">
                  <Check className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{reason.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-teal-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500 bg-teal-600 px-4 py-1.5 text-sm font-medium text-white mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Switch from {data.name} today
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Start hiring free — no strings attached
          </h2>
          <p className="text-teal-200 mb-8">
            Unlimited users, jobs, and candidates. No credit card. No contracts.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-teal-700 hover:bg-teal-50 transition-colors"
          >
            Create your free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function FeatureCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${highlight ? "bg-green-100" : "bg-slate-100"}`}>
        <Check className={`h-3.5 w-3.5 ${highlight ? "text-green-700" : "text-slate-400"}`} />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
        <X className="h-3.5 w-3.5 text-red-400" />
      </div>
    );
  }
  // String value
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${highlight ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
      {value}
    </span>
  );
}
