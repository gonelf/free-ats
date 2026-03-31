import Link from "next/link";
import { ArrowRight, Sparkles, Mail } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { hrEmailTemplatesList } from "./hr-email-templates-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free HR Email Templates — KiteHR",
  description:
    "25+ free HR email templates for every stage of the hiring process — rejection emails, offer letters, interview invites, onboarding, and more. Copy, customise, or automate with KiteHR.",
};

const categories = Array.from(new Set(hrEmailTemplatesList.map((t) => t.category)));

export default function HrEmailTemplatesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-teal-700 mb-5">
            <Mail className="h-3 w-3" />
            Free email templates
          </div>
          <h1 className="font-heading font-black tracking-tight text-slate-900 text-4xl md:text-5xl mb-4">
            HR Email Templates
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
            Professional templates for every stage of the hiring process. Copy and customise for free — or automate them with KiteHR so you never copy-paste again.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Automate hiring emails for free
          </Link>
        </div>
      </section>

      {/* Templates by category */}
      <section className="py-8 pb-24">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          {categories.map((category) => {
            const templates = hrEmailTemplatesList.filter((t) => t.category === category);
            return (
              <div key={category}>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <Link
                      key={template.slug}
                      href={`/hr-email-templates/${template.slug}`}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 text-sm group-hover:text-teal-700 transition-colors mb-1 leading-snug">
                            {template.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {template.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 mt-0.5 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
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
            Stop copying and pasting emails
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            KiteHR lets you automate any of these templates. Send personalised emails to 100 candidates in one click — from application acknowledgement to offer letters.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Try KiteHR email automation — free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
