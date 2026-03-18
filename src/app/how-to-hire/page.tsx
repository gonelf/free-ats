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
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Free hiring playbooks
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            How to Hire Guides
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-6">
            Practical, step-by-step hiring playbooks for every role. Salary benchmarks, where to post, how to interview, and mistakes to avoid.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
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
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roles.map((role) => {
                    const salary = `${role.salaryRange.currency === "USD" ? "$" : "£"}${Math.round(role.salaryRange.min / 1000)}k–${role.salaryRange.currency === "USD" ? "$" : "£"}${Math.round(role.salaryRange.max / 1000)}k`;
                    return (
                      <Link
                        key={role.slug}
                        href={`/how-to-hire/${role.slug}`}
                        className="group rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-cyan-500/20 hover:bg-cyan-500/3 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm group-hover:text-cyan-400 transition-colors mb-1 leading-snug">
                              How to Hire a {role.title}
                            </h3>
                            <p className="text-xs text-white/30">
                              {salary} · {role.timeToHire}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-white/15 shrink-0 mt-0.5 group-hover:text-cyan-400 transition-colors" />
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
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">Ready to start hiring?</h2>
            <p className="text-white/40 mb-6 text-sm">
              Use KiteHR to set up a custom hiring pipeline for any role in 2 minutes. Unlimited jobs, unlimited candidates, AI-powered tools — 100% free.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
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
