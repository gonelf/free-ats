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
    alternates: {
      canonical: `/interview-questions/${slug}`,
    },
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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/interview-questions"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All interview question guides
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              {data.category}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              {data.behavioralQuestions.length + data.technicalQuestions.length} questions
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">
            {data.title} Interview Questions
          </h1>
          <p className="text-base text-slate-500 max-w-2xl leading-relaxed mb-8">{data.intro}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Generate personalised questions with AI
            </Link>
            <Link
              href={`/job-descriptions/${slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View {data.title} job description
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Behavioural Questions</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Use these to assess past behaviour, values, and working style. Look for specific examples, not hypothetical answers.
                </p>
                <div className="space-y-4">
                  {data.behavioralQuestions.map((q, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-medium text-slate-900 mb-3 leading-relaxed">
                        <span className="text-teal-500 font-bold mr-2">{i + 1}.</span>
                        {q.question}
                      </p>
                      <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-teal-700">What to look for: </span>
                          {q.whatToLookFor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Questions */}
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Technical / Role-Specific Questions</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Use these to assess job-specific knowledge and skills relevant to the {data.title} role.
                </p>
                <div className="space-y-4">
                  {data.technicalQuestions.map((q, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-medium text-slate-900 mb-3 leading-relaxed">
                        <span className="text-teal-500 font-bold mr-2">{data.behavioralQuestions.length + i + 1}.</span>
                        {q.question}
                      </p>
                      <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-teal-700">What to look for: </span>
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
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-900">Red Flags to Watch For</h3>
                </div>
                <ul className="space-y-2.5">
                  {data.redFlags.map((flag, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI CTA */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                  <h3 className="text-sm font-semibold text-teal-900">Personalise these questions</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  These are great starting questions. Upload the candidate&apos;s CV to KiteHR and our AI will generate
                  personalised interview questions based on their actual experience.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors w-full"
                >
                  Try AI Interview Questions
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Interview tips */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Interview Tips</h3>
                <ul className="space-y-2.5">
                  {[
                    "Ask for specific examples, not hypothetical answers",
                    "Use consistent scoring rubrics across all candidates",
                    "Have at least two interviewers evaluate each dimension",
                    "Leave 10 minutes for candidate questions at the end",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-slate-500">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
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
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-600 bg-teal-600/50 px-4 py-1.5 text-sm text-teal-100 mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Hiring a {data.title}?
          </div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Run a structured, bias-free interview process with KiteHR
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            KiteHR helps you track candidates, upload CVs for AI-generated interview questions, and
            collaborate with your hiring team — all for free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Start hiring for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
