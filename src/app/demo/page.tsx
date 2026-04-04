import Link from "next/link";
import { ArrowRight, Clock, Shield } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { demoJobs } from "@/components/home/demo-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signal Demo Assessment — KiteHR",
  description:
    "Experience a Signal Micro-Audition. Choose a role and complete a 13-question, 10-minute AI skill assessment. No account needed.",
  alternates: { canonical: "/demo" },
};

const jobEmojis: Record<string, string> = {
  "frontend-engineer": "💻",
  "customer-success": "🤝",
  "product-manager": "🗺️",
  "sales-dev-rep": "📞",
  "data-analyst": "📊",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      <main className="container mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-semibold tracking-wider uppercase mb-4">
            Signal · Micro-Audition
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tight text-slate-900 mb-4">
            Experience a Signal Assessment
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Pick a role below and complete a real 13-question skill assessment.
            See exactly what candidates experience — and what hiring managers see.
          </p>
        </div>

        {/* Job cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {demoJobs.map((job) => (
            <Link
              key={job.id}
              href={`/demo/${job.id}`}
              className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl" role="img" aria-label={job.title}>
                  {jobEmojis[job.id] ?? "🎯"}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900 mb-1">
                  {job.title}
                </h2>
                <p className="text-sm text-slate-500">{job.tagline}</p>
              </div>
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  13 questions · ~10 min
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            No account needed
          </span>
          <span>·</span>
          <span>Free</span>
          <span>·</span>
          <span>Results shown immediately</span>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
