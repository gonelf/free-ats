import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ScreeningClient } from "@/components/screening/ScreeningClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ScreeningQuestion {
  id: string;
  question: string;
  type: string;
  intent?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const screening = await db.screening.findUnique({
    where: { screeningToken: token },
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
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const screening = await db.screening.findUnique({
    where: { screeningToken: token },
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

  // Reject expired tokens
  if (
    screening.screeningTokenExpiresAt &&
    screening.screeningTokenExpiresAt < new Date()
  ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-8 text-center">
          <div className="text-3xl mb-3">⏰</div>
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
            Link Expired
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
            This screening link has expired. Please contact the hiring team for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Strip intent field before sending to candidate
  const rawQuestions = screening.questions as ScreeningQuestion[];
  const questions = rawQuestions.map(({ intent: _intent, ...q }) => q);

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
            token={token}
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
