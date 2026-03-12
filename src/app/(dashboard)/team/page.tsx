import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Users, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            {org.members.length} member{org.members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Members */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Members</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {org.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                  {m.userId.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {m.userId === user!.id ? "You" : m.userId.slice(0, 8) + "..."}
                  </p>
                  <p className="text-xs text-gray-400">
                    Joined {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {roleLabel[m.role]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pending invitations */}
      {org.invitations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">
              Pending Invitations
            </h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {org.invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{inv.email}</p>
                    <p className="text-xs text-gray-400">
                      Expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-yellow-600 bg-yellow-50 rounded-full px-2.5 py-0.5">
                  Pending
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
