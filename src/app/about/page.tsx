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
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="KiteHR"
              width={72}
              height={72}
              className="rounded-2xl"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
            <Infinity className="h-3.5 w-3.5" />
            Free ATS, forever
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            Hiring software that&apos;s actually free
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            KiteHR is an applicant tracking system built for modern hiring teams — from first hire to high-volume recruiting.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-5">Why we built KiteHR</h2>
            <div className="space-y-4 text-white/50 leading-relaxed">
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
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-center mb-10">What we believe</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
                  <Check className="h-4 w-4 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center mb-10">What KiteHR includes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400 mb-4">
                FREE FOREVER
              </div>
              <h3 className="font-semibold text-white mb-4">Core ATS</h3>
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
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                      <Check className="h-2.5 w-2.5 text-green-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 mb-4">
                PRO — $49/MO
              </div>
              <h3 className="font-semibold text-white mb-4">AI Suite</h3>
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
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/15">
                      <Check className="h-2.5 w-2.5 text-cyan-400" />
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
      <section className="py-20 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">Start hiring today — free</h2>
            <p className="text-white/40 mb-8">
              No credit card. No time limits. Unlimited everything.
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
