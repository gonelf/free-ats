import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, Eye, MousePointer } from "lucide-react";
import { OutreachStatusBadge } from "@/components/admin/OutreachStatusBadge";
import { SendEmailForm } from "@/components/admin/SendEmailForm";
import { UpdateLeadForm } from "@/components/admin/UpdateLeadForm";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kitehr.co";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OutreachLeadPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  let lead = await db.outreachLead.findUnique({
    where: { id },
    include: { emails: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) notFound();

  // Ensure a claim token exists so the email form can show the personalised link
  if (!lead.claimToken || !lead.claimTokenExpiresAt || lead.claimTokenExpiresAt < new Date()) {
    const claimToken = randomBytes(32).toString("hex");
    const claimTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    lead = await db.outreachLead.update({
      where: { id },
      data: { claimToken, claimTokenExpiresAt },
      include: { emails: { orderBy: { createdAt: "desc" } } },
    });
  }

  const claimUrl = `${APP_URL}/claim?token=${lead.claimToken}`;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link
        href="/admin/outreach"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to outreach
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lead.companyName}</h1>
          {lead.website && (
            <a
              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:underline mt-1"
            >
              {lead.website} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <OutreachStatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Lead info + edit */}
        <UpdateLeadForm lead={lead} />

        {/* Email stats */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Email Stats</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Mail, label: "Sent", value: lead.emails.length },
              { icon: Eye, label: "Opened", value: lead.emails.filter((e) => e.openedAt).length },
              { icon: MousePointer, label: "Clicked", value: lead.emails.filter((e) => e.clickedAt).length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
                <Icon className="h-4 w-4 mx-auto mb-1 text-gray-400 dark:text-gray-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          {lead.lastContactedAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Last contacted: {new Date(lead.lastContactedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Send email */}
      {lead.status !== "unsubscribed" && lead.contactEmail && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Send Email to {lead.contactEmail}
          </h2>
          <SendEmailForm
            leadId={lead.id}
            companyName={lead.companyName}
            hiringFor={lead.hiringFor ?? ""}
            claimUrl={claimUrl}
          />
        </div>
      )}

      {/* Email history */}
      {lead.emails.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Email History ({lead.emails.length})
          </h2>
          <div className="space-y-3">
            {lead.emails.map((email) => (
              <div
                key={email.id}
                className="rounded-lg border border-gray-100 dark:border-gray-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {email.sentAt
                        ? `Sent ${new Date(email.sentAt).toLocaleString()}`
                        : "Draft (unsent)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {email.openedAt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs text-green-700 dark:text-green-400">
                        <Eye className="h-3 w-3" /> Opened
                      </span>
                    )}
                    {email.clickedAt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                        <MousePointer className="h-3 w-3" /> Clicked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
