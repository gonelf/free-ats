import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Check, AlertCircle, Briefcase } from "lucide-react";

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
      <ErrorPage message="Missing invitation token. Please use the link from your email." />
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
    return <ErrorPage message={result.error} />;
  }

  if (result.alreadyMember) {
    return (
      <InfoPage
        title="Already a member"
        message={`You're already a member of ${result.orgName}.`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to {result.orgName}!
        </h1>
        <p className="text-gray-500 mb-8">
          You&apos;ve successfully joined the team. Start collaborating on hiring.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Briefcase className="h-4 w-4" />
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Invalid invitation
        </h1>
        <p className="text-gray-500 mb-8">{message}</p>
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function InfoPage({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mx-auto mb-6">
          <Check className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 mb-8">{message}</p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
