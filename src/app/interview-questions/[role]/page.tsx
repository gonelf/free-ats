import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { getInterviewQuestionsRole, getAllInterviewQuestionsSlugs } from "../interview-questions-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ role: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: slug } = await params;
  const data = getInterviewQuestionsRole(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
  };
}

export function generateStaticParams() {
  return getAllInterviewQuestionsSlugs().map((slug) => ({ role: slug }));
}

export default async function InterviewQuestionsPage({ params }: Props) {
  const { role: slug } = await params;
  const data = getInterviewQuestionsRole(slug);
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
            href="/interview-questions"
            className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All interview question guides
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              {data.category}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">
              {data.behavioralQuestions.length + data.technicalQuestions.length} questions
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {data.title} Interview Questions
          </h1>
          <p className="text-base text-white/50 max-w-2xl leading-relaxed mb-8">{data.intro}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Generate personalised questions with AI
            </Link>
            <Link
              href={`/job-descriptions/${slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/60 hover:bg-white/10 transition-colors"
            >
              View {data.title} job description
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Behavioural Questions */}
      <section className="py-10 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-2">Behavioural Questions</h2>
                <p className="text-sm text-white/40 mb-6">
                  Use these to assess past behaviour, values, and working style. Look for specific examples, not hypothetical answers.
                </p>
                <div className="space-y-4">
                  {data.behavioralQuestions.map((q, i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-5">
                      <p className="text-sm font-medium text-white mb-3 leading-relaxed">
                        <span className="text-cyan-400/60 font-bold mr-2">{i + 1}.</span>
                        {q.question}
                      </p>
                      <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-3">
                        <p className="text-xs text-white/40 leading-relaxed">
                          <span className="font-semibold text-cyan-400/70">What to look for: </span>
                          {q.whatToLookFor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Questions */}
              <div>
                <h2 className="text-xl font-bold mb-2">Technical / Role-Specific Questions</h2>
                <p className="text-sm text-white/40 mb-6">
                  Use these to assess job-specific knowledge and skills relevant to the {data.title} role.
                </p>
                <div className="space-y-4">
                  {data.technicalQuestions.map((q, i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-5">
                      <p className="text-sm font-medium text-white mb-3 leading-relaxed">
                        <span className="text-cyan-400/60 font-bold mr-2">{data.behavioralQuestions.length + i + 1}.</span>
                        {q.question}
                      </p>
                      <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-3">
                        <p className="text-xs text-white/40 leading-relaxed">
                          <span className="font-semibold text-cyan-400/70">What to look for: </span>
                          {q.whatToLookFor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Red flags */}
              <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-400/70 shrink-0" />
                  <h3 className="text-sm font-semibold text-white">Red Flags to Watch For</h3>
                </div>
                <ul className="space-y-2.5">
                  {data.redFlags.map((flag, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-white/50">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/40" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI CTA */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-cyan-300">Personalise these questions</h3>
                </div>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  These are great starting questions. Upload the candidate&apos;s CV to KiteHR and our AI will generate
                  personalised interview questions based on their actual experience.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors w-full"
                >
                  Try AI Interview Questions
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Interview tips */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Interview Tips</h3>
                <ul className="space-y-2.5">
                  {[
                    "Ask for specific examples, not hypothetical answers",
                    "Use consistent scoring rubrics across all candidates",
                    "Have at least two interviewers evaluate each dimension",
                    "Leave 10 minutes for candidate questions at the end",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-white/40">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/40" />
                      {tip}
                    </li>
                  ))}
                </ul>
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
              Hiring a {data.title}?
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Run a structured, bias-free interview process with KiteHR
            </h2>
            <p className="text-white/40 mb-6 text-sm max-w-lg mx-auto">
              KiteHR helps you track candidates, upload CVs for AI-generated interview questions, and
              collaborate with your hiring team — all for free.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Start hiring for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
