import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  Users,
  GitBranch,
  Sparkles,
  Check,
  ArrowRight,
  Brain,
  Zap,
  FileText,
  Mail,
  BarChart3,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ATS — Applicant Tracking System with AI Features",
  description:
    "The free ATS for modern hiring teams. Manage jobs, track candidates, and unlock AI-powered features like resume parsing, candidate scoring, and email drafting.",
};

const freeFeatures = [
  "Unlimited jobs & candidates",
  "Custom pipeline stages",
  "Kanban drag-and-drop board",
  "Team collaboration",
  "Resume uploads & notes",
  "Email templates",
];

const aiFeatures = [
  { icon: Brain, text: "AI resume parsing" },
  { icon: Zap, text: "Candidate scoring (0–100)" },
  { icon: FileText, text: "Job description generator" },
  { icon: Mail, text: "AI email drafting" },
  { icon: BarChart3, text: "Pipeline bottleneck insights" },
  { icon: Sparkles, text: "Interview question generator" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/jobs");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Free ATS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
          </nav>
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
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700 mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          Free forever. AI features from $49/mo.
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-6 max-w-3xl mx-auto">
          The ATS that&apos;s free — with AI when you need it
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Track candidates, manage pipelines, and collaborate with your team at
          zero cost. Add AI to supercharge every step of your hiring process.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
          >
            View pricing
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          No credit card required. Set up in minutes.
        </p>
      </section>

      {/* Features grid */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to hire, free
            </h2>
            <p className="text-lg text-gray-500">
              Core ATS features that would cost hundreds elsewhere — always free.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
              title="Job Management"
              description="Create unlimited job postings with descriptions, requirements, and salary ranges."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5 text-indigo-600" />}
              title="Candidate Tracking"
              description="Build your talent pool with detailed profiles, resumes, notes, and tags."
            />
            <FeatureCard
              icon={<GitBranch className="h-5 w-5 text-indigo-600" />}
              title="Kanban Pipeline"
              description="Drag-and-drop candidates through custom stages from applied to hired."
            />
          </div>
        </div>
      </section>

      {/* Free vs Pro */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Free plan, no strings attached
              </h2>
              <p className="text-gray-500 mb-8">
                The free tier isn&apos;t a trial. It&apos;s the full ATS —
                unlimited jobs, unlimited candidates, team collaboration. Free forever.
              </p>
              <ul className="space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-700">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 mt-8 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-indigo-100 bg-gray-50 p-8">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">
                  Upgrade to Pro for AI superpowers
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                When you&apos;re ready to save hours per week, unlock the full AI suite for $49/mo.
              </p>
              <ul className="space-y-3">
                {aiFeatures.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100">
                        <Icon className="h-3 w-3 text-indigo-600" />
                      </div>
                      {f.text}
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/pricing"
                className="mt-6 block text-center rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                See all Pro features →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start hiring smarter today
          </h2>
          <p className="text-indigo-200 mb-8">
            Set up your ATS in minutes. No credit card, no time limits.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Create your free account
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
            <Link href="/pricing" className="hover:text-gray-600">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-gray-600">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-gray-600">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
