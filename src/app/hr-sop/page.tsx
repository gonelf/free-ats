import Link from "next/link";
import { ArrowRight, Sparkles, FileText } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 3600; // 1-hour ISR

export const metadata: Metadata = {
  title: "Free HR SOP Templates — Standard Operating Procedures for Hiring & HR — KiteHR",
  description:
    "125+ free HR SOP templates covering hiring, onboarding, performance reviews, compliance, and more. Step-by-step processes your team can use today — free with KiteHR.",
};

const CATEGORY_LABELS: Record<string, string> = {
  hiring: "Hiring Process",
  "hr-ops": "HR Operations",
  compliance: "Compliance",
  onboarding: "Onboarding",
  manager: "Manager & Team",
  benefits: "Benefits & Payroll",
  international: "International & Scaling",
};

export default async function HrSopPage() {
  let sops: { slug: string; title: string; category: string; description: string }[] = [];

  try {
    sops = await db.generatedSop.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, title: true, category: true, description: true },
      orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
    });
  } catch {
    // Table not yet migrated — show empty state
  }

  const categories = Object.keys(CATEGORY_LABELS).filter((cat) =>
    sops.some((s) => s.category === cat)
  );

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
            <FileText className="h-3.5 w-3.5" />
            Free SOP templates
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            HR Standard Operating Procedures
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-6">
            Step-by-step SOPs for every HR and hiring process. Free to use — or track them inside KiteHR so your whole team follows the same playbook.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="h-4 w-4" />
            Use SOPs in KiteHR — free
          </Link>
        </div>
      </section>

      {/* SOPs by category */}
      <section className="py-8 pb-24">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          {sops.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <FileText className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p className="text-sm">SOPs are being generated. Check back soon.</p>
            </div>
          ) : (
            categories.map((category) => {
              const items = sops.filter((s) => s.category === category);
              return (
                <div key={category}>
                  <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
                    {CATEGORY_LABELS[category] ?? category}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((sop) => (
                      <Link
                        key={sop.slug}
                        href={`/hr-sop/${sop.slug}`}
                        className="group rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-cyan-500/20 hover:bg-cyan-500/3 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm group-hover:text-cyan-400 transition-colors mb-1 leading-snug">
                              {sop.title}
                            </h3>
                            <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">
                              {sop.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-white/15 shrink-0 mt-0.5 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">
              Keep your whole team on the same process
            </h2>
            <p className="text-white/40 mb-6 text-sm">
              KiteHR gives your team access to all SOPs in one place. No more processes buried in Google Docs or Notion — completely free.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
