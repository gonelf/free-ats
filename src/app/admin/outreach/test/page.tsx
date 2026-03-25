import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestLeadPanel } from "@/components/admin/TestLeadPanel";

const TEST_EMAIL = "gonelf@gmail.com";
const TEST_ORG_SLUG = "_test-outreach_";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

export default async function OutreachTestPage() {
  await requireAdmin();

  const [lead, org] = await Promise.all([
    db.outreachLead.findFirst({
      where: { contactEmail: TEST_EMAIL },
      include: { emails: { orderBy: { createdAt: "desc" } } },
    }),
    db.organization.findUnique({
      where: { slug: TEST_ORG_SLUG },
      include: { jobs: true },
    }),
  ]);

  const claimUrl =
    org?.claimToken ? `${APP_URL}/claim?token=${org.claimToken}` : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/admin/outreach"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to outreach
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Outreach test sandbox</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Creates a test lead + unclaimed org with a job so you can test the full /claim flow.
          Hit <strong>Reset</strong> to start fresh whenever you want.
        </p>
      </div>

      <TestLeadPanel
        lead={
          lead
            ? {
                id: lead.id,
                status: lead.status,
                contactEmail: lead.contactEmail!,
                emailCount: lead.emails.length,
                lastEmail: lead.emails[0]
                  ? {
                      subject: lead.emails[0].subject,
                      sentAt: lead.emails[0].sentAt?.toISOString() ?? null,
                    }
                  : null,
              }
            : null
        }
        org={
          org
            ? {
                id: org.id,
                name: org.name,
                claimedStatus: org.claimedStatus,
                jobCount: org.jobs.length,
              }
            : null
        }
        claimUrl={claimUrl}
      />
    </div>
  );
}
