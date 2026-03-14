import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Check, AlertCircle } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

async function acceptInvitation(token: string, userId: string) {
  const invitation = await db.invitation.findFirst({
    where: {
      token,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { organization: true },
  });

  if (!invitation) {
    return { error: "This invitation link is invalid or has expired." };
  }

  // Check if already a member
  const existing = await db.member.findFirst({
    where: { userId, organizationId: invitation.organizationId },
  });

  if (existing) {
    return { alreadyMember: true, orgName: invitation.organization.name };
  }

  // Create member and mark invitation accepted
  await db.$transaction([
    db.member.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    }),
    db.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return { success: true, orgName: invitation.organization.name };
}

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <PageShell>
        <StatusCard
          icon={<AlertCircle className="h-8 w-8 text-red-400" />}
          iconBg="bg-red-500/10"
          title="Invalid invitation"
          message="Missing invitation token. Please use the link from your email."
          action={<Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Back to home</Link>}
        />
      </PageShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in — send to signup with token preserved
  if (!user) {
    redirect(`/signup?invitation_token=${encodeURIComponent(token)}`);
  }

  const result = await acceptInvitation(token, user.id);

  if (result.error) {
    return (
      <PageShell>
        <StatusCard
          icon={<AlertCircle className="h-8 w-8 text-red-400" />}
          iconBg="bg-red-500/10"
          title="Invalid invitation"
          message={result.error}
          action={<Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Back to home</Link>}
        />
      </PageShell>
    );
  }

  if (result.alreadyMember) {
    return (
      <PageShell>
        <StatusCard
          icon={<Check className="h-8 w-8 text-cyan-400" />}
          iconBg="bg-cyan-500/10"
          title="Already a member"
          message={`You're already a member of ${result.orgName}.`}
          action={
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors"
            >
              Go to dashboard
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <StatusCard
        icon={<Check className="h-8 w-8 text-green-400" />}
        iconBg="bg-green-500/10"
        title={`Welcome to ${result.orgName}!`}
        message="You've successfully joined the team. Start collaborating on hiring."
        action={
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors"
          >
            Go to dashboard
          </Link>
        }
      />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080c10] text-white flex flex-col">
      <PublicNav />
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}

function StatusCard({
  icon,
  iconBg,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="max-w-sm w-full text-center rounded-2xl border border-white/8 bg-white/3 p-10">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${iconBg} mx-auto mb-6`}>
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-white/40 mb-8">{message}</p>
      {action}
    </div>
  );
}
