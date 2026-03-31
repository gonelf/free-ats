import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { howToHireRolesList } from "./how-to-hire-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Hire Guides by Role — KiteHR",
  description:
    "Free step-by-step hiring playbooks for every role. Salary benchmarks, where to post, interview processes, and common mistakes — all in one place.",
};

const categories = Array.from(new Set(howToHireRolesList.map((r) => r.category)));

export default function HowToHirePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-teal-700 mb-5">
            <Sparkles className="h-3 w-3" />
            Free hiring playbooks
          </div>
          <h1 className="font-heading font-black tracking-tight text-slate-900 text-4xl md:text-5xl mb-4">
            How to Hire Guides
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
            Practical, step-by-step hiring playbooks for every role. Salary benchmarks, where to post, how to interview, and mistakes to avoid.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
          >
            Set up a hiring pipeline for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Playbooks by category */}
      <section className="py-8 pb-24">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          {categories.map((category) => {
            const roles = howToHireRolesList.filter((r) => r.category === category);
            return (
              <div key={category}>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roles.map((role) => {
                    const salary = `${role.salaryRange.currency === "USD" ? "$" : "£"}${Math.round(role.salaryRange.min / 1000)}k–${role.salaryRange.currency === "USD" ? "$" : "£"}${Math.round(role.salaryRange.max / 1000)}k`;
                    return (
                      <Link
                        key={role.slug}
                        href={`/how-to-hire/${role.slug}`}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 text-sm group-hover:text-teal-700 transition-colors mb-1 leading-snug">
                              How to Hire a {role.title}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {salary} · {role.timeToHire}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 mt-0.5 group-hover:text-teal-600 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Ready to start hiring?
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            Use KiteHR to set up a custom hiring pipeline for any role in 2 minutes. Unlimited jobs, unlimited candidates, AI-powered tools — 100% free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
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
