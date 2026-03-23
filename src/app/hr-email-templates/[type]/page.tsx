import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, Mail, Copy } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getHrEmailTemplate, getAllHrEmailTemplateSlugs } from "../hr-email-templates-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ type: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type: slug } = await params;
  const data = getHrEmailTemplate(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `/hr-email-templates/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllHrEmailTemplateSlugs().map((slug) => ({ type: slug }));
}

export default async function HrEmailTemplatePage({ params }: Props) {
  const { type: slug } = await params;
  const data = getHrEmailTemplate(slug);
  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/hr-email-templates"
            className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All HR email templates
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              <Mail className="h-3 w-3" />
              {data.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {data.title} Template
          </h1>
          <p className="text-base text-white/50 max-w-2xl leading-relaxed mb-8">{data.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Automate this email in KiteHR
            </Link>
          </div>
        </div>
      </section>

      {/* Main template */}
      <section className="py-10 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Template tabs (default + variants) */}
              {data.variants.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                    Default template
                  </span>
                  {data.variants.map((v, i) => (
                    <span key={i} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">
                      {v.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Subject line */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Subject Line</label>
                  <span className="flex items-center gap-1 text-xs text-white/25">
                    <Copy className="h-3 w-3" />
                    Copy
                  </span>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 font-mono text-sm text-white/80">
                  {data.subject}
                </div>
              </div>

              {/* Email body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Email Body</label>
                  <span className="flex items-center gap-1 text-xs text-white/25">
                    <Copy className="h-3 w-3" />
                    Copy
                  </span>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-5 font-mono text-sm text-white/70 leading-relaxed whitespace-pre-line">
                  {data.body}
                </div>
              </div>

              {/* Variant templates */}
              {data.variants.map((variant, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-white mb-4">
                    Variant: {variant.label}
                  </h3>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Subject</label>
                    <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 font-mono text-sm text-white/80">
                      {variant.subject}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Body</label>
                    <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-5 font-mono text-sm text-white/70 leading-relaxed whitespace-pre-line">
                      {variant.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Tips */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Customisation Tips</h3>
                <ul className="space-y-2.5">
                  {data.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-white/50">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/50" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Placeholders */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Placeholders</h3>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">
                  Replace all items in [SQUARE BRACKETS] with the relevant information before sending.
                </p>
                <div className="space-y-1.5">
                  {[
                    "[CANDIDATE_FIRST_NAME]",
                    "[COMPANY_NAME]",
                    "[JOB_TITLE]",
                    "[RECRUITER_NAME]",
                    "[DATE]",
                  ].map((p) => (
                    <div key={p} className="rounded-lg border border-white/5 bg-white/2 px-3 py-1.5 font-mono text-xs text-cyan-400/60">
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Automation CTA */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-cyan-300">Stop copying and pasting</h3>
                </div>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  KiteHR lets you automate this email to every candidate in one click — personalised with their name, role, and stage automatically.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors w-full"
                >
                  Try email automation for free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Automate your hiring emails
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Stop copying and pasting. Send to 100 candidates in one click.
            </h2>
            <p className="text-white/40 mb-6 text-sm max-w-lg mx-auto">
              KiteHR includes built-in email templates and AI email drafting. Send personalised messages to every candidate automatically — completely free.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/hr-email-templates"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white/60 hover:bg-white/10 transition-colors"
              >
                Browse more templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
