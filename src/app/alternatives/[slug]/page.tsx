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
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/8 blur-[140px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
            {data.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight leading-tight">
            {data.headline}
          </h1>
          <p className="text-xl text-cyan-400 font-medium mb-4">{data.subheadline}</p>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed">
            {data.intro}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Start free — no credit card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white/80 hover:bg-white/10 transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Cost calculator */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">
              How much could you save?
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto">
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
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center mb-10">
            Why teams choose KiteHR
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.points.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-cyan-500/20 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
                  <Check className="h-4 w-4 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{point.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center mb-10">What's included — free, forever</h2>
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
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 px-4 py-3"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
                <span className="text-sm text-white/70">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Pro — $49/mo per workspace</p>
              <p className="text-sm text-white/40 mt-0.5">
                Unlock AI resume parsing, candidate scoring, job description generation, skills gap analysis, and more. One flat price for your whole team.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              See Pro features →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {data.faqs.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
            <div className="space-y-3">
              {data.faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Ready to switch?
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Start hiring free today
            </h2>
            <p className="text-white/40 mb-8">
              Unlimited users, jobs, and candidates. No credit card. No contracts. No time limits.
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

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-white/8 bg-white/2 overflow-hidden">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-white/80 hover:text-white transition-colors list-none">
        {q}
        <ChevronDown className="h-4 w-4 text-white/30 transition-transform group-open:rotate-180 shrink-0 ml-4" />
      </summary>
      <div className="px-5 pb-4">
        <p className="text-sm text-white/50 leading-relaxed">{a}</p>
      </div>
    </details>
  );
}
