import Link from "next/link";
import Image from "next/image";
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
  Infinity,
  UserPlus,
  Building2,
} from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KiteHR — Applicant Tracking System with AI Features",
  description:
    "Free applicant tracking system for modern hiring teams. Unlimited users, job posts & candidates — forever free. AI resume parsing available.",
};

const unlimitedItems = [
  { icon: Users, label: "Unlimited Users", desc: "Invite your whole team" },
  { icon: Briefcase, label: "Unlimited Job Posts", desc: "No posting limits, ever" },
  { icon: UserPlus, label: "Unlimited Candidates", desc: "Track every applicant" },
  { icon: FileText, label: "Unlimited Resumes", desc: "Store & search all files" },
  { icon: GitBranch, label: "Unlimited Pipelines", desc: "Custom stages per role" },
  { icon: Building2, label: "Unlimited Orgs", desc: "Manage multiple companies" },
];

const freeFeatures = [
  "Kanban drag-and-drop board",
  "Custom pipeline stages",
  "Team collaboration & roles",
  "Resume uploads & storage",
  "Candidate notes & tags",
  "Email templates",
  "No credit card required",
  "No time limits",
];

const aiFeatures = [
  { icon: Brain, text: "AI resume parsing" },
  { icon: Zap, text: "Candidate scoring (0–100)" },
  { icon: FileText, text: "Job description generator" },
  { icon: Mail, text: "AI email drafting" },
  { icon: BarChart3, text: "Pipeline bottleneck insights" },
  { icon: Sparkles, text: "Interview question generator" },
];

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "KiteHR",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description":
    "Free applicant tracking system for modern hiring teams. Unlimited users, job posts, and candidates with AI-powered resume parsing and candidate scoring.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "url": "https://kitehr.co",
  "screenshot": "https://kitehr.co/og-image.png",
  "featureList":
    "Applicant Tracking, Resume Parsing, Candidate Scoring, Kanban Pipeline, Job Description Generator, Email Templates",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "KiteHR",
  "url": "https://kitehr.co",
  "logo": "https://kitehr.co/logo.png",
  "description":
    "KiteHR provides a free applicant tracking system with AI features for modern hiring teams.",
  "sameAs": [
    "https://www.linkedin.com/company/kitehr",
    "https://twitter.com/kitehr",
  ],
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/jobs");
  }

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-green-500/8 blur-[80px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-150" />
              <Image
                src="/logo.png"
                alt="KiteHR"
                width={80}
                height={80}
                className="relative rounded-2xl"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-8">
            <Infinity className="h-3.5 w-3.5" />
            Truly unlimited. Truly free.
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            The Free{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Applicant Tracking System
            </span>{" "}
            for Modern Hiring Teams
          </h1>
          <p className="text-lg text-white/60 mb-6 max-w-2xl mx-auto leading-relaxed">
            KiteHR is a free applicant tracking system (ATS) built for startups, small businesses,
            and growing teams. Studies show that companies using an ATS reduce time-to-hire by up to
            40% and cut cost-per-hire by 30% (SHRM, 2024). Unlike legacy ATS platforms that charge
            per user or per job post, KiteHR gives you unlimited everything — users, job posts, and
            candidates — at zero cost. Over 500 hiring teams use KiteHR to manage their entire
            recruitment pipeline from job posting to offer letter.
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
          <p className="mt-5 text-sm text-white/30">
            No credit card required · Set up in minutes · No time limits
          </p>

          {/* Social proof metrics bar */}
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap text-sm">
            <div className="flex items-center gap-2 text-white/50">
              <Check className="h-4 w-4 text-green-400 shrink-0" />
              <span>500+ hiring teams</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 text-white/50">
              <Check className="h-4 w-4 text-green-400 shrink-0" />
              <span>10,000+ candidates tracked</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 text-white/50">
              <Check className="h-4 w-4 text-green-400 shrink-0" />
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Unlimited Everything */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 mb-5">
              <Infinity className="h-3.5 w-3.5" />
              No limits. No tiers. No gotchas.
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Unlimited everything,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                free
              </span>
            </h2>
            <p className="text-lg text-white/40 max-w-xl mx-auto">
              Most ATS tools charge per user or per job post. We don&apos;t.
              Everything below is included in the free plan — forever.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {unlimitedItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="group rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 mb-4 group-hover:bg-cyan-500/15 transition-colors">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="text-base font-semibold text-white mb-1">{item.label}</div>
                  <div className="text-sm text-white/40">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why ATS Matters */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Why Modern Teams Use an{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                Applicant Tracking System
              </span>
            </h2>
            <p className="text-white/50 mb-6 leading-relaxed">
              Research from LinkedIn&apos;s 2024 Future of Recruiting report found that 78% of
              recruiters say ATS software is essential to managing high-volume hiring. An applicant
              tracking system centralizes candidate data, automates repetitive tasks, and ensures no
              qualified applicant falls through the cracks.
            </p>
            <p className="text-white/40 mb-10 leading-relaxed">
              KiteHR&apos;s ATS gives every team — from first hire to enterprise-scale recruiting —
              the infrastructure to run a consistent, fair, and fast hiring process.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Kanban hiring pipeline",
                  desc: "Visualize every candidate's stage at a glance",
                },
                {
                  title: "AI resume parsing",
                  desc: "Extract skills and experience in under 3 seconds",
                },
                {
                  title: "Candidate scoring",
                  desc: "Rank applicants by fit score automatically",
                },
                {
                  title: "Team collaboration",
                  desc: "Leave notes, assign reviewers, make decisions together",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/8 bg-white/3 p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 mt-0.5">
                      <Check className="h-3 w-3 text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-white/40">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Free Features */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400 mb-6">
                FREE PLAN
              </div>
              <h2 className="text-3xl font-bold mb-4">
                The full ATS experience,{" "}
                <span className="text-white/40">at zero cost</span>
              </h2>
              <p className="text-white/40 mb-8 leading-relaxed">
                This isn&apos;t a trial or a watered-down version. It&apos;s the complete ATS
                — unlimited everything, team collaboration, and the tools you need to hire well.
              </p>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/70">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              <DarkFeatureCard
                icon={<Briefcase className="h-5 w-5 text-cyan-400" />}
                title="Job Management"
                description="Create unlimited job postings with descriptions, requirements, and salary ranges. No posting fees."
                badge="Unlimited"
              />
              <DarkFeatureCard
                icon={<Users className="h-5 w-5 text-cyan-400" />}
                title="Team Collaboration"
                description="Invite every recruiter, hiring manager, and stakeholder. No per-seat pricing."
                badge="Unlimited users"
              />
              <DarkFeatureCard
                icon={<GitBranch className="h-5 w-5 text-cyan-400" />}
                title="Kanban Pipeline"
                description="Drag-and-drop candidates through fully custom stages — from applied to hired."
                badge="Custom stages"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Upgrade */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/5 to-white/2 p-10 md:p-14 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-green-500/6 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 mb-6">
                  <Sparkles className="h-3 w-3" />
                  PRO — $49/MO
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Supercharge hiring{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                    with AI
                  </span>
                </h2>
                <p className="text-white/40 mb-8 leading-relaxed">
                  When you&apos;re ready to save hours each week, unlock the full AI suite.
                  Still unlimited users and jobs — now with intelligence on top.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  See all Pro features
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div>
                <ul className="space-y-3">
                  {aiFeatures.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li key={f.text} className="flex items-center gap-3 text-sm text-white/70">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                          <Icon className="h-4 w-4 text-cyan-400" />
                        </div>
                        {f.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <Image src="/logo.png" alt="KiteHR" width={52} height={52} className="rounded-xl opacity-90" />
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Start hiring smarter today
            </h2>
            <p className="text-white/40 mb-8 text-lg">
              Unlimited everything. No credit card. No tricks.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-9 py-4 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-white/25">
              Free forever · Unlimited users, jobs & candidates
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function DarkFeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-cyan-500/20 hover:bg-white/5 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{title}</h3>
            {badge && (
              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-white/40">{description}</p>
        </div>
      </div>
    </div>
  );
}
