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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/hr-email-templates"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All HR email templates
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <Mail className="h-3 w-3" />
              {data.category}
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">
            {data.title} Template
          </h1>
          <p className="text-base text-slate-500 max-w-2xl leading-relaxed mb-8">{data.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Automate this email in KiteHR
            </Link>
          </div>
        </div>
      </section>

      {/* Main template */}
      <section className="py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Template tabs (default + variants) */}
              {data.variants.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                    Default template
                  </span>
                  {data.variants.map((v, i) => (
                    <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                      {v.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Subject line */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject Line</label>
                  <span className="flex items-center gap-1 text-xs text-slate-300">
                    <Copy className="h-3 w-3" />
                    Copy
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
                  {data.subject}
                </div>
              </div>

              {/* Email body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Body</label>
                  <span className="flex items-center gap-1 text-xs text-slate-300">
                    <Copy className="h-3 w-3" />
                    Copy
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 font-mono text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {data.body}
                </div>
              </div>

              {/* Variant templates */}
              {data.variants.map((variant, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Variant: {variant.label}
                  </h3>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
                      {variant.subject}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Body</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 font-mono text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {variant.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Tips */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Customisation Tips</h3>
                <ul className="space-y-2.5">
                  {data.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-slate-500">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Placeholders */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Placeholders</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
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
                    <div key={p} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 font-mono text-xs text-teal-600">
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Automation CTA */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                  <h3 className="text-sm font-semibold text-teal-900">Stop copying and pasting</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  KiteHR lets you automate this email to every candidate in one click — personalised with their name, role, and stage automatically.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors w-full"
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
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600 bg-teal-600/50 px-4 py-1.5 text-sm text-teal-100 mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Automate your hiring emails
          </div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Stop copying and pasting. Send to 100 candidates in one click.
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            KiteHR includes built-in email templates and AI email drafting. Send personalised messages to every candidate automatically — completely free.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hr-email-templates"
              className="inline-flex items-center gap-2 rounded-xl border border-teal-600 px-7 py-3.5 text-sm font-bold text-teal-100 hover:bg-teal-600/50 transition-colors"
            >
              Browse more templates
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
