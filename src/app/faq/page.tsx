import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — KiteHR",
  description:
    "Answers to common questions about KiteHR — pricing, features, data, and how the free ATS works.",
};

const faqSections = [
  {
    title: "Pricing & Plans",
    faqs: [
      {
        q: "Is the free plan really free forever?",
        a: "Yes. KiteHR's core ATS — unlimited jobs, candidates, users, and pipelines — is free with no time limits, no usage caps, and no credit card required. It's not a trial.",
      },
      {
        q: "What's included in the free plan?",
        a: "The free plan includes unlimited job posts, unlimited candidate profiles, unlimited users, custom pipeline stages, kanban drag-and-drop, team collaboration, resume uploads, candidate notes and tags, and email templates.",
      },
      {
        q: "What do I get with Pro?",
        a: "Pro ($49/mo per workspace) unlocks the full AI suite: AI resume parsing, candidate scoring (0–100), job description generation, AI email drafting, interview question generation, skills gap analysis, pipeline bottleneck insights, auto-tagging, candidate summaries, job bias checking, salary suggestions, and reference check questions.",
      },
      {
        q: "Is Pro pricing per seat or per workspace?",
        a: "Per workspace. $49/mo covers your entire team — no matter how many users you have. Adding more team members doesn't increase the cost.",
      },
      {
        q: "Can I cancel Pro anytime?",
        a: "Yes. Pro is month-to-month with no long-term contracts. Cancel anytime from your billing settings. Your data and free plan features stay intact.",
      },
      {
        q: "What happens to my data if I cancel Pro?",
        a: "All your data — candidates, jobs, pipelines, notes — stays exactly as it was. You lose access to AI features, but nothing else changes.",
      },
      {
        q: "Do you offer discounts for nonprofits?",
        a: "The free plan already covers everything nonprofits typically need. If you have specific questions about Pro pricing for nonprofits, reach out to us.",
      },
    ],
  },
  {
    title: "Features",
    faqs: [
      {
        q: "How many job posts can I create?",
        a: "Unlimited. There are no caps on active or total job posts on any plan.",
      },
      {
        q: "How many users can I invite to my workspace?",
        a: "Unlimited. Invite your whole team — recruiters, hiring managers, executives — at no additional cost.",
      },
      {
        q: "Can I customize my hiring pipeline stages?",
        a: "Yes. You can create custom pipeline stages per job — rename them, reorder them, and add as many as you need.",
      },
      {
        q: "Does KiteHR support public job listings?",
        a: "Yes. Each job posting gets a public URL (yourdomain.kitehr.co/jobs/role-name) that you can share or embed on your careers page.",
      },
      {
        q: "Can candidates apply directly through KiteHR?",
        a: "Yes. The public job page includes an application form where candidates can submit their resume and information directly.",
      },
      {
        q: "Does the AI resume parsing work with any resume format?",
        a: "The AI parser handles PDF resumes and pasted text. It works with most standard resume formats and extracts name, contact info, work history, education, and skills.",
      },
      {
        q: "Can I try AI features before subscribing?",
        a: "AI feature buttons are visible on the free plan — clicking them prompts you to upgrade. There's no separate AI trial, but the upgrade unlocks everything instantly.",
      },
    ],
  },
  {
    title: "Data & Security",
    faqs: [
      {
        q: "Where is my data stored?",
        a: "KiteHR uses Supabase (PostgreSQL) for database storage and AWS S3 for resume file storage. Data is hosted on secure, encrypted cloud infrastructure.",
      },
      {
        q: "Can I export my data?",
        a: "Candidate and job data can be exported from your workspace. Contact us if you need a full data export.",
      },
      {
        q: "Is KiteHR GDPR compliant?",
        a: "KiteHR follows GDPR-aligned practices including data minimization, secure storage, and the ability to delete candidate records. Contact us for detailed compliance documentation.",
      },
      {
        q: "Who can see my candidate data?",
        a: "Only users you invite to your workspace can access your candidates and jobs. Candidate data is never shared across organizations or used to train AI models.",
      },
    ],
  },
  {
    title: "Getting Started",
    faqs: [
      {
        q: "How long does setup take?",
        a: "Most teams are up and running in under 10 minutes. Sign up, create a workspace, post a job, and you're ready to start reviewing candidates.",
      },
      {
        q: "Do I need a credit card to sign up?",
        a: "No. The free plan requires no credit card and has no time limit. You only need payment info if you choose to upgrade to Pro.",
      },
      {
        q: "Can I migrate from another ATS?",
        a: "You can manually import candidates via the candidate creation flow. If you need a bulk import from a previous ATS, contact us for assistance.",
      },
      {
        q: "Is there a mobile app?",
        a: "KiteHR is a web application optimized for desktop use. It's accessible from any modern browser including mobile, but the experience is best on desktop.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqSections.flatMap((section) =>
    section.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    }))
  ),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently asked questions
          </h1>
          <p className="text-lg text-white/40">
            Everything you need to know about KiteHR.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-8 pb-24">
        <div className="mx-auto max-w-3xl px-6 space-y-16">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-cyan-400 mb-6">{section.title}</h2>
              <div className="space-y-6">
                {section.faqs.map((faq) => (
                  <div key={faq.q} className="border-b border-white/5 pb-6 last:border-0">
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/8 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-white/40 mb-8">
              Start with the free plan — no credit card, no commitment.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
