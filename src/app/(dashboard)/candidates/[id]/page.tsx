import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ExternalLink, FileText, ChevronLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
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
    include: { organization: { select: { id: true, plan: true } } },
  });

  const candidate = await db.candidate.findFirst({
    where: { id, organizationId: member.organization.id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      aiSummary: true,
      applications: {
        include: {
          job: { select: { id: true, title: true, status: true } },
          stage: { select: { name: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!candidate) notFound();

  const isPro = member.organization.plan === "PRO";
  const jobs = await db.job.findMany({
    where: { organizationId: member.organization.id, status: "OPEN" },
    select: { id: true, title: true },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/candidates" className="hover:text-gray-900">
          <ChevronLeft className="inline h-4 w-4" />
          Candidates
        </Link>
        <span>/</span>
        <span className="text-gray-900">
          {candidate.firstName} {candidate.lastName}
        </span>
      </div>

      <CandidateDetailClient
        candidate={candidate}
        isPro={isPro}
        currentUserId={user!.id}
        jobs={jobs}
      />
    </div>
  );
}
