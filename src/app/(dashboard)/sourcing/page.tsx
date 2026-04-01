import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { SourcingClient } from "@/components/sourcing/SourcingClient";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "AI Sourcing — KiteHR",
  description: "Find candidates in your talent pool using natural language.",
};

export default async function SourcingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    include: { organization: { select: { id: true, plan: true, aiCreditsBalance: true } } },
  });

  const openJobs = await db.job.findMany({
    where: { organizationId: member.organization.id, status: "OPEN" },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  const hasAiAccess =
    member.organization.plan === "PRO" || member.organization.aiCreditsBalance > 0;

  const totalCandidates = await db.candidate.count({
    where: { organizationId: member.organization.id },
  });

  return (
    <div>
      <PageHeader
        title="AI Sourcing Copilot"
        subtitle={`Search your talent pool of ${totalCandidates} candidate${totalCandidates !== 1 ? "s" : ""} using natural language.`}
      />
      <SourcingClient hasAiAccess={hasAiAccess} openJobs={openJobs} />
    </div>
  );
}
