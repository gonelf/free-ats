import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CreditCard, Users, Settings } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    include: { organization: { select: { name: true, plan: true, slug: true } } },
  });

  const org = member.organization;
  const isPro = org.plan === "PRO";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Organization</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{org.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Slug</dt>
              <dd className="text-gray-700">{org.slug}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <h2 className="font-semibold text-gray-900">Billing</h2>
                <p className="text-sm text-gray-500">
                  Current plan:{" "}
                  <span
                    className={
                      isPro ? "text-indigo-600 font-medium" : "text-gray-700"
                    }
                  >
                    {isPro ? "Pro" : "Free"}
                  </span>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/billing">
                {isPro ? "Manage" : "Upgrade"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <h2 className="font-semibold text-gray-900">Team</h2>
                <p className="text-sm text-gray-500">
                  Manage team members and invitations
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/team">Manage Team</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
