import Link from "next/link";
import {
  Check,
  Minus,
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  FileText,
  Mail,
  BarChart3,
  Users,
  Tag,
  Target,
  Shield,
  DollarSign,
  HelpCircle,
  Infinity,
} from "lucide-react";
import type { Metadata } from "next";
import { PublicNav, PublicFooter } from "@/components/public-layout";

export const metadata: Metadata = {
  title: "Pricing — KiteHR",
  description:
    "Free forever for core ATS features. Upgrade to Pro for $49/mo to unlock the full AI suite: resume parsing, candidate scoring, email drafting, and more.",
};

const proFeatures = [
  { icon: Brain, label: "AI resume parsing", description: "Auto-fill candidate profiles from PDF/text resumes" },
  { icon: Zap, label: "Candidate scoring", description: "Rank candidates 0–100 vs. job requirements" },
  { icon: FileText, label: "Job description generator", description: "Generate compelling JDs from a job title" },
  { icon: Mail, label: "AI email drafting", description: "Outreach, rejection, and offer letters in seconds" },
  { icon: Sparkles, label: "Interview question generator", description: "Tailored screening and interview questions" },
  { icon: BarChart3, label: "Pipeline bottleneck insights", description: "Spot where candidates drop off" },
  { icon: Users, label: "Skills gap analysis", description: "Compare candidate skills to job requirements" },
  { icon: Tag, label: "Auto-tagging candidates", description: "Automatically tag candidates based on resume" },
  { icon: Target, label: "Candidate summary", description: "One-click AI-generated candidate overview" },
  { icon: Shield, label: "Job bias checker", description: "Flag language that could deter applicants" },
  { icon: DollarSign, label: "Salary range suggestions", description: "Market-informed pay range recommendations" },
  { icon: HelpCircle, label: "Reference check questions", description: "Generate tailored reference questions" },
];

const freeFeatures = [
  "Unlimited jobs",
  "Unlimited candidates",
  "Unlimited users",
  "Custom pipeline stages",
  "Kanban drag-and-drop board",
  "Team collaboration & roles",
  "Resume file uploads",
  "Candidate notes",
  "Email templates",
];

const faqs = [
  {
    q: "Is the free plan really free forever?",
    a: "Yes. The core ATS — jobs, candidates, pipelines, team — is free with no usage limits and no time limit.",
  },
  {
    q: "What happens to my data if I cancel Pro?",
    a: "All your data stays intact. You simply lose access to AI features. Your candidates, jobs, and pipelines are unaffected.",
  },
  {
    q: "Is there a per-seat charge?",
    a: "No. Pro is $49/month per workspace, regardless of how many team members you have.",
  },
  {
    q: "Can I try AI features before subscribing?",
    a: "AI buttons are visible on the Free plan — upgrading unlocks them instantly. No trial period needed.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-sm text-teal-700 font-medium mb-6">
            <Infinity className="h-3.5 w-3.5" />
            No per-seat fees. No hidden charges.
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 tracking-tight text-slate-900">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Start free. Upgrade when you need AI. Unlimited users and jobs on every plan.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 mb-4">
                FREE FOREVER
              </div>
              <h2 className="text-xl font-bold text-slate-900">Free</h2>
              <p className="text-sm text-slate-500 mt-1">Full ATS, unlimited everything</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-slate-900">$0</span>
              <span className="text-slate-400 ml-2">/ month</span>
            </div>
            <Link
              href="/signup"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors mb-8"
            >
              Get started free
            </Link>
            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-700" />
                  </div>
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <Minus className="h-4 w-4" />
                </div>
                AI features
              </li>
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-teal-600 bg-white p-8 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-teal-700 px-4 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-4">
                <Sparkles className="h-3 w-3" />
                AI POWERED
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pro</h2>
              <p className="text-sm text-slate-500 mt-1">Everything in Free + full AI suite</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-slate-900">$49</span>
              <span className="text-slate-400 ml-2">/ month per workspace</span>
            </div>
            <Link
              href="/signup"
              className="block w-full rounded-xl bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-teal-800 transition-colors mb-8"
            >
              <span className="flex items-center justify-center gap-2">
                Start free, upgrade anytime
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
              Everything in Free, plus:
            </div>
            <ul className="space-y-3">
              {proFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.label} className="flex items-start gap-3 text-sm">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">{f.label}</span>
                      <span className="text-slate-500"> — {f.description}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 py-24 bg-slate-50">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-slate-200 pb-8 last:border-0">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-teal-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-teal-200 mb-8">
            Create your free account and start hiring in minutes.
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
