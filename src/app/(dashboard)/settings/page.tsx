import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CreditCard, Users, Settings, Palette, Share2, CheckCircle2 } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { isFlagEnabled, FLAGS } from "@/lib/feature-flags";
import { getAdminUser } from "@/lib/admin";
import { LinkedInDisconnectButton } from "@/components/integrations/LinkedInDisconnectButton";
import { CopyFeedUrl } from "@/components/integrations/CopyFeedUrl";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    include: { organization: { select: { id: true, name: true, plan: true, slug: true } } },
  });

  const org = member.organization;
  const isPro = org.plan === "PRO";

  const isAdmin = !!(await getAdminUser());
  const jobDistributionEnabled = await isFlagEnabled(FLAGS.JOB_DISTRIBUTION, isAdmin);

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Organization</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{org.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Slug</dt>
              <dd className="text-gray-700 dark:text-gray-300">{org.slug}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred color theme
              </p>
            </div>
          </div>
          <ThemeSelector />
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Billing</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current plan:{" "}
                  <span
                    className={
                      isPro ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-700 dark:text-gray-300"
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

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Team</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Job Distribution</h2>
            </div>

            <div className="space-y-6">
              {/* LinkedIn */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">LinkedIn</span>
                    {linkedinIntegration && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* Indeed */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Indeed</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Always active
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
