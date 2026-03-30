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
    <div className="min-h-screen bg-[#080c10] text-white selection:bg-cyan-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <PublicNav />

      {/* Hero Section */}
      <section className="relative pt-12 pb-12 lg:pt-16 lg:pb-16 overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-green-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10 font-sans">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Column: Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                Designed for modern HR teams
              </div>
              
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
                The Hub for{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                  High-Performance
                </span>{" "}
                Recruiting
              </h1>
              
              <p className="text-base md:text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
                KiteHR is the first truly unlimited applicant tracking system. 
                Centralize your entire hiring process, from first applied to offer accepted, 
                with professional-grade tools and AI insights.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-base font-bold text-[#080c10] hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95"
                >
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  View features
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-[10px] text-white/45 font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500/50" /> Unlimited Jobs</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500/50" /> Unlimited Users</span>
              </div>
            </div>

            {/* Right Column: Product Preview */}
            <div className="relative group max-w-[600px] lg:max-w-none mx-auto lg:mx-0 w-full">
              {/* Glowing frame decoration */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-green-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
              
              <div className="relative rounded-[1.5rem] border border-white/10 bg-[#0c1219] overflow-hidden shadow-2xl transition-all duration-500 group-hover:translate-y-[-4px]">
                {/* Browser chrome headers */}
                <div className="flex items-center gap-2 px-5 py-3.5 bg-white/[0.03] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-md bg-black/20 text-[9px] text-white/45 font-mono border border-white/5 min-w-[120px] overflow-hidden truncate">
                    kitehr.co/pipelines/default
                  </div>
                </div>

                {/* Main App Image */}
                <Image 
                  src="/showcase-pipeline.png" 
                  alt="KiteHR Pipeline Dashboard" 
                  width={1000} 
                  height={562}
                  className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  priority
                />
              </div>

              {/* Decorative mini-cards (visible on xl screens) */}
              <div className="absolute -right-4 -bottom-4 hidden xl:block animate-pulse duration-[4000ms]">
                <div className="rounded-xl border border-white/10 bg-[#080c10]/95 backdrop-blur-md p-3.5 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Candidate Hired</div>
                      <div className="text-[9px] text-white/50 truncate max-w-[100px]">Sarah Miller · Product Designer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main product feature focus */}
      <section className="py-24 bg-[#080c10] border-t border-white/5">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for fast-moving teams</h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-16">
            KiteHR isn&apos;t just an ATS. It&apos;s a productivity tool designed to reduce time-to-hire 
            by centralizing every candidate interaction in one sleek, unified interface.
          </p>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-[2rem] border border-white/10 bg-[#0c1219] overflow-hidden shadow-2xl">
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
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-6">
                <Sparkles className="h-3 w-3" />
                AI-POWERED INTELLIGENCE
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight text-white">
                Hire with data, <br />
                <span className="text-white/60">not just intuition</span>
              </h2>
              <p className="text-lg text-white/60 mb-10 leading-relaxed">
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
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-bold text-lg mb-1 text-white">{item.title}</div>
                      <div className="text-sm text-white/60 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unlimited Features Grid */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white text-center">Built for scale, free for everyone</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              We believe in removing barriers to hiring. That&apos;s why our core features 
              are unlimited for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlimitedItems.map((item, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.label}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Massive glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-white">
            Ready to upgrade your team&apos;s hiring process?
          </h2>
          <p className="text-xl text-white/70 mb-12">
            Join over 500 teams already hiring better with KiteHR. 
            No cost, no limits, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-5 text-lg font-black text-[#080c10] hover:bg-white/90 hover:scale-105 transition-all shadow-2xl"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-white/60 font-medium">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500/70" /> Unlimited Jobs</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500/70" /> Unlimited Users</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500/70" /> No Card Required</span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}


