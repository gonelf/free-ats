import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import Link from "next/link";
import { Mail, ExternalLink, FlaskConical } from "lucide-react";
import { OutreachStatusBadge } from "@/components/admin/OutreachStatusBadge";
import { AddLeadButton } from "@/components/admin/AddLeadButton";
import { RunScraperButton } from "@/components/admin/RunScraperButton";
import { BulkSendButton } from "@/components/admin/BulkSendButton";
import { FindContactsButton } from "@/components/admin/FindContactsButton";

const STATUS_FILTERS = ["all", "new", "contacted", "responded", "converted", "bounced", "unsubscribed"] as const;

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OutreachPage({ searchParams }: Props) {
  await requireAdmin();

  const { status: statusFilter = "all", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const pageSize = 50;

  const where = statusFilter !== "all" ? { status: statusFilter } : {};

  const [leads, total, stats, bulkEligibleCount, missingContactCount] = await Promise.all([
    db.outreachLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { emails: true } } },
    }),
    db.outreachLead.count({ where }),
    db.outreachLead.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    // Leads eligible for bulk send: new + has contact email
    db.outreachLead.count({ where: { status: "new", contactEmail: { not: null } } }),
    // Leads missing contact but have a website we can search
    db.outreachLead.count({ where: { contactEmail: null, website: { not: null } } }),
  ]);

  const statMap = Object.fromEntries(
    stats.map((s) => [s.status, s._count.status])
  );
  const totalLeads = Object.values(statMap).reduce((a, b) => a + b, 0);
  const contacted = (statMap["contacted"] ?? 0) + (statMap["responded"] ?? 0) + (statMap["converted"] ?? 0);
  const converted = statMap["converted"] ?? 0;
  const responseRate = contacted > 0 ? Math.round((converted / contacted) * 100) : 0;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Outreach</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cold email pipeline for acquiring new companies
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/outreach/test"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FlaskConical className="h-4 w-4" />
            Test
          </Link>
          <FindContactsButton missingCount={missingContactCount} />
          <BulkSendButton eligibleCount={bulkEligibleCount} />
          <RunScraperButton />
          <AddLeadButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total leads", value: totalLeads, color: "text-gray-900 dark:text-gray-100" },
          { label: "Contacted", value: contacted, color: "text-blue-600 dark:text-blue-400" },
          { label: "Converted", value: converted, color: "text-green-600 dark:text-green-400" },
          { label: "Conversion rate", value: `${responseRate}%`, color: "text-indigo-600 dark:text-indigo-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => {
          const count = s === "all" ? totalLeads : (statMap[s] ?? 0);
          return (
            <Link
              key={s}
              href={`/admin/outreach?status=${s}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {s} {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No leads yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Run the HN scraper or add leads manually to get started.
            </p>
            <div className="mt-4">
              <RunScraperButton />
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Company</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Contact</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Hiring for</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Source</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Emails</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{lead.companyName}</div>
                      {lead.website && (
                        <a
                          href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {lead.website}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {lead.contactEmail ? (
                        <div>
                          <div className="text-gray-700 dark:text-gray-300">{lead.contactEmail}</div>
                          {lead.contactName && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">{lead.contactName}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">No email</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{lead.hiringFor ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {lead.source.replace("_", " ")}
                      </span>
                      {lead.sourceUrl && (
                        <a
                          href={lead.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 text-indigo-500 hover:underline"
                        >
                          <ExternalLink className="inline h-3 w-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <OutreachStatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                      {lead._count.emails}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/outreach/${lead.id}`}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/outreach?status=${statusFilter}&page=${page - 1}`}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/outreach?status=${statusFilter}&page=${page + 1}`}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
