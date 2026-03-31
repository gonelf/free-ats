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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-teal-700 mb-5">
            <FileText className="h-3 w-3" />
            Free SOP templates
          </div>
          <h1 className="font-heading font-black tracking-tight text-slate-900 text-4xl md:text-5xl mb-4">
            HR Standard Operating Procedures
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
            Step-by-step SOPs for every HR and hiring process. Free to use — or track them inside KiteHR so your whole team follows the same playbook.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
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
            <div className="text-center py-16 text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p className="text-sm">SOPs are being generated. Check back soon.</p>
            </div>
          ) : (
            categories.map((category) => {
              const items = sops.filter((s) => s.category === category);
              return (
                <div key={category}>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    {CATEGORY_LABELS[category] ?? category}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((sop) => (
                      <Link
                        key={sop.slug}
                        href={`/hr-sop/${sop.slug}`}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 text-sm group-hover:text-teal-700 transition-colors mb-1 leading-snug">
                              {sop.title}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {sop.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 mt-0.5 group-hover:text-teal-600 transition-colors" />
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
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Keep your whole team on the same process
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            KiteHR gives your team access to all SOPs in one place. No more processes buried in Google Docs or Notion — completely free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
