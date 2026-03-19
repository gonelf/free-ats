import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CreditCard, Users, Settings, Share2, CheckCircle2 } from "lucide-react";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";
import { LinkedInDisconnectButton } from "@/components/integrations/LinkedInDisconnectButton";
import { CopyFeedUrl } from "@/components/integrations/CopyFeedUrl";

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

  const jobDistributionEnabled = await isFlagEnabled(FLAGS.JOB_DISTRIBUTION);

  const linkedinIntegration = jobDistributionEnabled
    ? await db.integration.findUnique({
        where: {
          organizationId_platform: {
            organizationId: org.id,
            platform: "linkedin",
          },
        },
      })
    : null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const indeedFeedUrl = `${appUrl}/${org.slug}/jobs.xml`;

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

        {jobDistributionEnabled && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Job Distribution</h2>
            </div>

            <div className="space-y-6">
              {/* LinkedIn */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">LinkedIn</span>
                    {linkedinIntegration && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Jobs are automatically posted to your LinkedIn company page when published.
                  </p>
                </div>
                <div className="shrink-0">
                  {linkedinIntegration ? (
                    <LinkedInDisconnectButton />
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/api/integrations/linkedin/connect">Connect</Link>
                    </Button>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Indeed */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">Indeed</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Always active
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Paste your job feed URL in the Indeed Employer dashboard under{" "}
                  <strong>Job Feed URL</strong>. Indeed will automatically crawl your open jobs.
                </p>
                <CopyFeedUrl url={indeedFeedUrl} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
