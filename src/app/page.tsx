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
  UserPlus,
  Building2,
} from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KiteHR — Applicant Tracking System with AI Features",
  description:
    "Free applicant tracking system for modern hiring teams. Unlimited users, job posts & candidates — forever free. AI resume parsing available.",
  alternates: {
    canonical: "/",
  },
};

const unlimitedItems = [
  { icon: Users, label: "Unlimited Users", desc: "Invite your whole team" },
  { icon: Briefcase, label: "Unlimited Job Posts", desc: "No posting limits, ever" },
  { icon: UserPlus, label: "Unlimited Candidates", desc: "Track every applicant" },
  { icon: FileText, label: "Unlimited Resumes", desc: "Store & search all files" },
  { icon: GitBranch, label: "Unlimited Pipelines", desc: "Custom stages per role" },
  { icon: Building2, label: "Unlimited Orgs", desc: "Manage multiple companies" },
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <PublicNav variant="light" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-12 lg:pt-16 lg:pb-16 overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Column: Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-semibold tracking-wider uppercase mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Designed for modern HR teams
              </div>

              <h1
                className="font-heading font-black tracking-tight mb-6 leading-[1.05] text-slate-900"
                style={{ fontSize: "clamp(2.5rem, 4vw + 1.25rem, 4.5rem)" }}
              >
                The Hub for{" "}
                <span className="text-teal-700">
                  High-Performance
                </span>{" "}
                Recruiting
              </h1>

              <p className="text-base md:text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                KiteHR is the first truly unlimited applicant tracking system.
                Centralize your entire hiring process, from first applied to offer accepted,
                with professional-grade tools and AI insights.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-all active:scale-95"
                >
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                >
                  View features
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-[11px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-500" /> Unlimited Jobs</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-500" /> Unlimited Users</span>
              </div>
            </div>

            {/* Right Column: Product Preview */}
            <div className="relative group max-w-[600px] lg:max-w-none mx-auto lg:mx-0 w-full">
              <div className="relative rounded-[1.5rem] border border-slate-200 bg-white overflow-hidden shadow-2xl transition-all duration-500 group-hover:translate-y-[-4px] group-hover:shadow-[0_32px_64px_-12px_rgba(15,118,110,0.1)]">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-md bg-slate-200 text-[9px] text-slate-500 border border-slate-300 min-w-[120px] overflow-hidden truncate">
                    kitehr.co/pipelines/default
                  </div>
                </div>

                {/* Main App Image */}
                <Image
                  src="/showcase-pipeline.png"
                  alt="KiteHR Pipeline Dashboard"
                  width={1000}
                  height={562}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Decorative mini-card */}
              <div className="absolute -right-3 -bottom-5 hidden lg:block">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Candidate Hired</div>
                      <div className="text-[9px] text-slate-400 truncate max-w-[100px]">Sarah Miller · Product Designer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 border-t border-slate-100">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-xl">
                <Image
                  src="/showcase-ai.png"
                  alt="AI Analysis Mockup"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-semibold tracking-wider uppercase mb-6">
                <Sparkles className="h-3 w-3" />
                AI-powered intelligence
              </div>
              <h2
                className="font-heading font-bold mb-6 text-slate-900"
                style={{ fontSize: "clamp(1.75rem, 2.5vw + 1rem, 3rem)", lineHeight: 1.1 }}
              >
                Hire with data, <br />
                <span className="text-slate-400">not just intuition</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our Pro suite adds a layer of intelligence to your hiring. Parse resumes instantly, score candidates
                against job criteria, and generate custom interview questions in seconds.
              </p>

              <div className="grid gap-6">
                {[
                  { icon: Brain, title: "AI Resume Parsing", desc: "Extract skills and details automatically." },
                  { icon: Zap, title: "Candidate Scoring", desc: "Rank applicants based on job fit." },
                  { icon: Mail, title: "Smart Outreach", desc: "Generate personalized emails in one click." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-lg mb-1 text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-600 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unlimited Features */}
      <section className="py-20 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20 items-start">
            {/* Left: heading */}
            <div className="lg:pt-1">
              <h2
                className="font-heading font-bold mb-5 text-slate-900"
                style={{ fontSize: "clamp(1.75rem, 2.5vw + 1rem, 3rem)", lineHeight: 1.1 }}
              >
                Built for scale,<br />free for everyone
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                We believe in removing barriers to hiring. Core features are unlimited — no seat limits, no posting caps, no expiry.
              </p>
            </div>

            {/* Right: feature list */}
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {unlimitedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="font-heading font-semibold text-slate-800">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-teal-700 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl px-6 relative z-10 text-center">
          <h2
            className="font-heading font-bold mb-8 tracking-tight text-white"
            style={{ fontSize: "clamp(2rem, 3.5vw + 1.25rem, 4rem)", lineHeight: 1.05 }}
          >
            Ready to upgrade your team&apos;s hiring process?
          </h2>
          <p className="text-xl text-teal-100 mb-12">
            Trusted by startups, nonprofits, and growing teams worldwide — free forever, with no seat limits or hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-4 text-lg font-black text-teal-700 hover:bg-teal-50 hover:scale-105 transition-all shadow-lg"
            >
              Get started for free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-teal-200 font-medium">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-teal-300" /> Unlimited Jobs</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-teal-300" /> Unlimited Users</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-teal-300" /> No Card Required</span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
