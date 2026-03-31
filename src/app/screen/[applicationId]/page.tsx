import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ScreeningClient } from "@/components/screening/ScreeningClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}): Promise<Metadata> {
  const { applicationId } = await params;
  const screening = await db.screening.findUnique({
    where: { applicationId },
    include: { application: { include: { job: { select: { title: true } } } } },
  });
  if (!screening) return { title: "Screening — KiteHR" };
  return {
    title: `Application Screening — ${screening.application.job.title}`,
    description: "Complete your application screening.",
  };
}

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  const screening = await db.screening.findUnique({
    where: { applicationId },
    include: {
      application: {
        include: {
          job: {
            select: {
              title: true,
              organization: { select: { name: true } },
            },
          },
          candidate: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!screening) notFound();

  interface ScreeningQuestion {
    id: string;
    question: string;
    type: string;
  }

  const questions = screening.questions as ScreeningQuestion[];
  const responses = (screening.responses as Array<{ questionId: string }> | null) ?? [];
  const answeredIds = new Set(responses.map((r) => r.questionId));
  const unansweredQuestions = questions.filter((q) => !answeredIds.has(q.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {screening.application.job.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {screening.application.job.organization.name} · Application Screening
          </p>
        </div>

        {screening.completedAt ? (
          <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8 text-center">
            <div className="text-3xl mb-3">✓</div>
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
              Screening Complete
            </h2>
            <p className="text-sm text-green-700 dark:text-green-400 mt-2">
              Thank you, {screening.application.candidate.firstName}. Your responses have been submitted.
              The hiring team will be in touch soon.
            </p>
          </div>
        ) : (
          <ScreeningClient
            applicationId={applicationId}
            candidateName={screening.application.candidate.firstName}
            questions={unansweredQuestions}
            totalQuestions={questions.length}
            answeredCount={answeredIds.size}
          />
        )}
      </div>
    </div>
  );
}
