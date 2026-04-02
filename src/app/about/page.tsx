import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Infinity } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — KiteHR",
  description:
    "KiteHR is a free applicant tracking system built for modern hiring teams. Unlimited jobs, candidates, and users — forever free, with optional AI.",
};

const values = [
  {
    title: "Hiring tools should be accessible",
    description:
      "Good recruiting software shouldn't require a six-figure budget. We built KiteHR so any team — startup, nonprofit, agency, small business — can hire well without paying enterprise prices.",
  },
  {
    title: "Unlimited means unlimited",
    description:
      "We don't believe in artificial limits. Unlimited users, jobs, and candidates aren't a premium feature — they're the baseline. Your tool should grow with you.",
  },
  {
    title: "AI should accelerate, not replace",
    description:
      "AI features in KiteHR are tools to save time, not autopilot the hiring process. You make the calls — AI handles the busywork.",
  },
  {
    title: "Transparency over tricks",
    description:
      "No hidden fees, no sudden plan changes, no gotcha limits. The free plan is genuinely free. Pro is $49/mo flat. That's it.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="KiteHR"
              width={72}
              height={72}
              className="rounded-2xl"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6">
            <Infinity className="h-3.5 w-3.5" />
            Free ATS, forever
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-5 tracking-tight text-slate-900">
            Hiring software that&apos;s actually free
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            KiteHR is an applicant tracking system built for modern hiring teams — from first hire to high-volume recruiting.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Why we built KiteHR</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Recruiting software has a problem: the tools worth using are expensive, and the free ones are too limited to actually use.
              </p>
              <p>
                Per-seat pricing, per-job-post fees, annual contracts, feature limits at every turn — it all adds up to thousands of dollars before you&apos;ve made a single hire.
              </p>
              <p>
                We built KiteHR to fix that. The core ATS — unlimited jobs, users, candidates, and pipelines — is free forever. When you&apos;re ready to add AI capabilities, Pro is $49/mo flat. That&apos;s it. No per-seat pricing, no hidden fees, no contracts.
              </p>
              <p>
                Great hiring tools should be available to every team, not just the ones that can afford a six-figure software budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">What we believe</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 mb-4">
                  <Check className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">What KiteHR includes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 mb-4">
                FREE FOREVER
              </div>
              <h3 className="font-semibold text-slate-900 mb-4">Core ATS</h3>
              <ul className="space-y-2">
                {[
                  "Unlimited jobs",
                  "Unlimited candidates",
                  "Unlimited users",
                  "Custom pipeline stages",
                  "Kanban drag-and-drop board",
                  "Team collaboration",
                  "Resume uploads & storage",
                  "Candidate notes & tags",
                  "Email templates",
                  "Public job listing pages",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-2.5 w-2.5 text-green-700" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-teal-600 bg-white p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-4">
                PRO — $49/MO
              </div>
              <h3 className="font-semibold text-slate-900 mb-4">AI Suite</h3>
              <ul className="space-y-2">
                {[
                  "AI resume parsing",
                  "Candidate scoring (0–100)",
                  "Job description generator",
                  "AI email drafting",
                  "Interview question generator",
                  "Skills gap analysis",
                  "Pipeline bottleneck insights",
                  "Auto-tagging candidates",
                  "Candidate summaries",
                  "Job bias checker",
                  "Salary range suggestions",
                  "Reference check questions",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100">
                      <Check className="h-2.5 w-2.5 text-teal-700" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-teal-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start hiring today — free</h2>
          <p className="text-teal-200 mb-8">
            No credit card. No time limits. Unlimited everything.
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
