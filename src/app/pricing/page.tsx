import Link from "next/link";
import {
  Check,
  Minus,
  Sparkles,
  Briefcase,
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
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free ATS",
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
  "Custom pipeline stages",
  "Kanban drag-and-drop board",
  "Team collaboration & roles",
  "Resume file uploads",
  "Candidate notes",
  "Email templates",
  "Stripe billing integration",
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
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Free ATS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Start free. Upgrade when you need AI. No per-seat fees, no hidden charges.
        </p>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Free</h2>
              <p className="text-sm text-gray-500 mt-1">
                Full ATS, forever free
              </p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500 ml-2">/ month</span>
            </div>
            <Link
              href="/signup"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 mb-8"
            >
              Get started free
            </Link>
            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Minus className="h-4 w-4 shrink-0" />
                AI features
              </li>
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-indigo-600 p-8 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Pro</h2>
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Everything in Free + full AI suite
              </p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900">$49</span>
              <span className="text-gray-500 ml-2">/ month per workspace</span>
            </div>
            <Link
              href="/signup"
              className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700 mb-8"
            >
              <span className="flex items-center justify-center gap-2">
                Start free, upgrade anytime
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <ul className="space-y-3">
              <li className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Everything in Free, plus:
              </li>
              {proFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.label} className="flex items-start gap-3 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 shrink-0 mt-0.5">
                      <Icon className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{f.label}</span>
                      <span className="text-gray-500"> — {f.description}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-500 mb-8">
            Create your free account and start hiring in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
              <Briefcase className="h-3 w-3 text-white" />
            </div>
            <span>Free ATS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/login" className="hover:text-gray-600">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-600">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
