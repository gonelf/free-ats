import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import { CandidateDetailClient } from "@/components/candidates/CandidateDetailClient";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    include: { organization: { select: { id: true, plan: true, aiCreditsBalance: true } } },
  });

  const candidateRaw = await db.candidate.findFirst({
    where: { id, organizationId: member.organization.id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      aiSummary: true,
      communications: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          subject: true,
          body: true,
          authorId: true,
          createdAt: true,
          job: { select: { id: true, title: true } },
        },
      },
      applications: {
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              pipeline: {
                include: {
                  stages: { orderBy: { order: "asc" } },
                },
              },
            },
          },
          stage: { select: { id: true, name: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!candidateRaw) notFound();

  // Cast Json fields to typed shapes
  type WorkExperience = { title: string; company: string; startDate: string; endDate: string; description: string };
  type AiScoreSummary = { strengths: string[]; gaps: string[]; recommendation: string };
  const candidate = {
    ...candidateRaw,
    workExperience: (candidateRaw.workExperience as WorkExperience[] | null) ?? [],
    applications: candidateRaw.applications.map((app) => ({
      ...app,
      aiScoreSummary: app.aiScoreSummary as AiScoreSummary | null,
    })),
  };

  const hasAiAccess = member.organization.plan === "PRO" || member.organization.aiCreditsBalance > 0;
  const jobs = await db.job.findMany({
    where: { organizationId: member.organization.id, status: "OPEN" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/candidates" className="hover:text-gray-900 dark:hover:text-gray-100">
          <ChevronLeft className="inline h-4 w-4" />
          Candidates
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">
          {candidate.firstName} {candidate.lastName}
        </span>
      </div>

      <CandidateDetailClient
        candidate={candidate}
        hasAiAccess={hasAiAccess}
        currentUserId={user!.id}
        jobs={jobs}
        communications={candidate.communications}
      />
    </div>
  );
}
