import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Mail, Users2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { InviteDialog } from "@/components/team/InviteDialog";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Team — KiteHR",
};

const roleLabel: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    include: {
      organization: {
        include: {
          members: { orderBy: { createdAt: "asc" } },
          invitations: {
            where: { acceptedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  const org = member.organization;
  const canInvite = ["OWNER", "ADMIN"].includes(member.role);

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle={`${org.members.length} member${org.members.length !== 1 ? "s" : ""}`}
        action={canInvite ? <InviteDialog /> : undefined}
      />

      {/* Members */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Members</h2>
        </div>
        <ul className="divide-y divide-gray-50 dark:divide-gray-800">
          {org.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-sm font-medium text-indigo-700 dark:text-indigo-400">
                  {m.userId.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {m.userId === user!.id ? "You" : m.userId.slice(0, 8) + "..."}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Joined {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                {roleLabel[m.role]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pending invitations */}
      {org.invitations.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Pending Invitations
            </h2>
          </div>
          <ul className="divide-y divide-gray-50 dark:divide-gray-800">
            {org.invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{inv.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-full px-2.5 py-0.5">
                  Pending
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {org.invitations.length === 0 && org.members.length === 1 && (
        <EmptyState
          icon={<Users2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
          title="Invite your team"
          description="Collaborators can view jobs, manage candidates, and move them through the pipeline."
        />
      )}
    </div>
  );
}
