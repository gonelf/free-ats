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
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-5">
            <Mail className="h-3.5 w-3.5" />
            Free email templates
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            HR Email Templates
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-6">
            Professional templates for every stage of the hiring process. Copy and customise for free — or automate them with KiteHR so you never copy-paste again.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
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
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <Link
                      key={template.slug}
                      href={`/hr-email-templates/${template.slug}`}
                      className="group rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-cyan-500/20 hover:bg-cyan-500/3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm group-hover:text-cyan-400 transition-colors mb-1 leading-snug">
                            {template.title}
                          </h3>
                          <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">
                            {template.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/15 shrink-0 mt-0.5 group-hover:text-cyan-400 transition-colors" />
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
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">Stop copying and pasting emails</h2>
            <p className="text-white/40 mb-6 text-sm">
              KiteHR lets you automate any of these templates. Send personalised emails to 100 candidates in one click — from application acknowledgement to offer letters.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Try KiteHR email automation — free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
