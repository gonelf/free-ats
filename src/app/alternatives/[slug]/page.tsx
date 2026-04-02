import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getAlternativePage, getAllAlternativeSlugs } from "../alternatives-data";
import { CostCalculatorWithDefaults } from "@/components/CostCalculatorWithDefaults";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getAlternativePage(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `/alternatives/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllAlternativeSlugs().map((slug) => ({ slug }));
}

export default async function AlternativePage({ params }: Props) {
  const { slug } = await params;
  const data = getAlternativePage(slug);
  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6">
            {data.badge}
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-5 tracking-tight leading-tight text-slate-900">
            {data.headline}
          </h1>
          <p className="text-xl text-teal-700 font-medium mb-4">{data.subheadline}</p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            {data.intro}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-colors"
            >
              Start free — no credit card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Cost calculator */}
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How much could you save?
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Adjust your team size and open roles to see a real cost comparison between KiteHR and {data.competitorName}.
            </p>
          </div>
          <CostCalculatorWithDefaults
            competitorName={data.competitorName}
            config={data.calculatorConfig}
            showEmployees={data.showEmployees}
            defaultSeats={data.calculatorDefaults.seats}
            defaultJobs={data.calculatorDefaults.jobs}
            defaultEmployees={data.calculatorDefaults.employees}
          />
        </div>
      </section>

      {/* Key points */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            Why teams choose KiteHR
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.points.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-200 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 mb-4">
                  <Check className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{point.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">What&apos;s included — free, forever</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              "Unlimited job postings",
              "Unlimited users",
              "Unlimited candidates",
              "Custom hiring pipelines",
              "Drag-and-drop kanban board",
              "Email templates",
              "Resume storage",
              "Team collaboration",
              "No credit card required",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3 w-3 text-green-700" />
                </div>
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border-2 border-teal-600 bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <Sparkles className="h-5 w-5 text-teal-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Pro — $49/mo per workspace</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Unlock AI resume parsing, candidate scoring, job description generation, skills gap analysis, and more. One flat price for your whole team.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 text-sm text-teal-700 hover:text-teal-800 transition-colors font-semibold"
            >
              See Pro features →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {data.faqs.length > 0 && (
        <section className="py-16 border-b border-slate-100">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently asked questions</h2>
            <div className="space-y-3">
              {data.faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-teal-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500 bg-teal-600 px-4 py-1.5 text-sm font-medium text-white mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Ready to switch?
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Start hiring free today
          </h2>
          <p className="text-teal-200 mb-8">
            Unlimited users, jobs, and candidates. No credit card. No contracts. No time limits.
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

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white overflow-hidden">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors list-none">
        {q}
        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180 shrink-0 ml-4" />
      </summary>
      <div className="px-5 pb-4">
        <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
      </div>
    </details>
  );
}
