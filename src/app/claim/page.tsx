import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Briefcase, Users, Kanban } from "lucide-react";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ClaimPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/signup");
  }

  // Find the org by claim token
  const org = await db.organization.findFirst({
    where: {
      claimToken: token,
      claimedStatus: "UNCLAIMED",
      claimTokenExpiresAt: { gt: new Date() },
    },
    include: {
      jobs: { where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!org) {
    // Token expired or already claimed
    return (
      <div className="flex min-h-screen items-center justify-content: center bg-[#080c10] text-white">
        <div className="mx-auto max-w-md text-center px-6">
          <div className="text-5xl mb-6">🔗</div>
          <h1 className="text-2xl font-bold mb-3">This link has expired</h1>
          <p className="text-white/50 mb-6">
            This claim link has already been used or has expired. Sign up normally to get started.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-cyan-500 text-[#080c10] font-semibold px-6 py-3 rounded-xl hover:bg-cyan-400 transition-colors"
          >
            Create a free account
          </Link>
        </div>
      </div>
    );
  }

  // Check if the user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is already logged in — process the claim immediately
    const existingMember = await db.member.findFirst({
      where: { userId: user.id, organizationId: org.id },
    });

    if (!existingMember) {
      await db.member.create({
        data: { userId: user.id, organizationId: org.id, role: "OWNER" },
      });
    }

    await db.organization.update({
      where: { id: org.id },
      data: {
        claimedStatus: "CLAIMED",
        claimToken: null,
        claimTokenExpiresAt: null,
      },
    });

    redirect("/jobs");
  }

  // Not logged in — show the claim landing page
  const firstJob = org.jobs[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";
  const jobUrl = firstJob ? `${appUrl}/${org.slug}/jobs/${firstJob.slug}` : null;

  return (
    <div className="flex min-h-screen bg-[#080c10] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <Image src="/logo.png" alt="KiteHR" width={36} height={36} className="rounded-xl" />
          <span className="font-semibold text-lg text-white">KiteHR</span>
        </Link>

        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 font-medium mb-4">
              <CheckCircle2 className="h-4 w-4" />
              Your workspace is ready
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {org.name} is on KiteHR
            </h1>
            <p className="text-white/50 text-base">
              We&apos;ve set up your hiring workspace — your jobs are already live and ready to collect applications.
            </p>
          </div>

          {/* Job preview card */}
          {firstJob && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
                  <Briefcase className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/40 mb-0.5 uppercase tracking-wide">Active job posting</p>
                  <p className="font-semibold text-white truncate">{firstJob.title}</p>
                  {firstJob.location && (
                    <p className="text-sm text-white/40 mt-0.5">{firstJob.location}</p>
                  )}
                </div>
                {jobUrl && (
                  <a
                    href={jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                  >
                    View live →
                  </a>
                )}
              </div>
              {org.jobs.length > 1 && (
                <p className="text-xs text-white/30 mt-3 pl-14">
                  +{org.jobs.length - 1} more open role{org.jobs.length > 2 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* What you get */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Kanban, label: "Kanban pipeline", sub: "Track every applicant" },
              { icon: Users, label: "Unlimited users", sub: "Add your whole team" },
              { icon: Briefcase, label: "All jobs included", sub: "No per-job pricing" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                <Icon className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-white">{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href={`/signup?claim_token=${encodeURIComponent(token)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors"
            >
              Claim your workspace — it&apos;s free
            </Link>
            <Link
              href={`/login?next=${encodeURIComponent(`/claim?token=${token}`)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/8 hover:text-white transition-colors"
            >
              I already have an account — log in
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-white/25">
            Free forever. No credit card. Unlimited users, jobs, and candidates.
          </p>
        </div>
      </div>
    </div>
  );
}
