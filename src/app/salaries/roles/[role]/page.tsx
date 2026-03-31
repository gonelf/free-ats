import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, TrendingDown } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { db } from "@/lib/db";
import { getRoleBySlug, formatSalary, SALARY_CITIES } from "../../salary-data";
import type { Metadata } from "next";

export const revalidate = 86400;

type Props = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: roleSlug } = await params;
  const role = getRoleBySlug(roleSlug);
  if (!role) return {};
  return {
    title: `${role.title} Salary by City 2025 — KiteHR`,
    description: `Compare ${role.title} salaries across 50 US and UK cities. See the local vs. remote cost difference and calculate your hiring savings.`,
    alternates: {
      canonical: `/salaries/roles/${roleSlug}`,
    },
  };
}

export default async function RoleHubPage({ params }: Props) {
  const { role: roleSlug } = await params;
  const role = getRoleBySlug(roleSlug);
  if (!role) return notFound();

  const entries = await db.salaryEntry.findMany({
    where: { roleSlug, publishedAt: { not: null } },
    select: {
      citySlug: true,
      cityName: true,
      stateName: true,
      country: true,
      localSalaryMedian: true,
      remoteSalaryMedian: true,
      savingsPercent: true,
      annualSavings: true,
      currency: true,
    },
    orderBy: { localSalaryMedian: "desc" },
  });

  if (entries.length === 0) return notFound();

  const maxSalary = entries[0].localSalaryMedian;
  const avgSavings = Math.round(entries.reduce((s, e) => s + e.savingsPercent, 0) / entries.length);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${role.title} Salary by City 2025`,
    description: `Annual salary benchmarks for ${role.title} across ${entries.length} US and UK cities, including local vs. remote cost comparison.`,
    url: `https://kitehr.co/salaries/roles/${roleSlug}`,
    creator: { "@type": "Organization", name: "KiteHR", url: "https://kitehr.co" },
    temporalCoverage: "2025",
    spatialCoverage: "United States, United Kingdom",
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-10">
          <Link
            href="/salaries"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Salary Guide
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs text-teal-700 mb-4">
            {role.category}
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-slate-900 mb-4">
            {role.title} Salary by City
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mb-8">
            Compare {role.title} salaries across {entries.length} cities. The highest-paying market is{" "}
            <strong className="text-slate-900">{entries[0]?.cityName}</strong> at{" "}
            <strong className="text-teal-700">
              {formatSalary(entries[0]?.localSalaryMedian ?? 0, entries[0]?.currency as "USD" | "GBP")}
            </strong>. On average you can save{" "}
            <strong className="text-emerald-600">{avgSavings}%</strong> by hiring remote.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
              <p className="text-xs text-slate-400 mt-1">Cities tracked</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-teal-700">
                {formatSalary(maxSalary, entries[0]?.currency as "USD" | "GBP")}
              </p>
              <p className="text-xs text-slate-400 mt-1">Highest market</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{avgSavings}%</p>
              <p className="text-xs text-slate-400 mt-1">Avg remote savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* City salary table */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">
            {role.title} Salaries — All Cities
          </h2>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">City</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Local Median</th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wide">Remote</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wide">Savings</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const cur = entry.currency as "USD" | "GBP";
                  const barWidth = Math.round((entry.localSalaryMedian / maxSalary) * 100);
                  return (
                    <tr
                      key={entry.citySlug}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        i === entries.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{entry.cityName}</p>
                          <p className="text-xs text-slate-400">{entry.stateName} · {entry.country}</p>
                          {/* Inline salary bar */}
                          <div className="mt-1.5 h-1 rounded-full bg-slate-100 w-full max-w-[120px]">
                            <div
                              className="h-1 rounded-full bg-teal-400"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">
                        {formatSalary(entry.localSalaryMedian, cur)}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-right text-emerald-600">
                        {formatSalary(entry.remoteSalaryMedian, cur)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                          <TrendingDown className="h-3 w-3" />
                          {entry.savingsPercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/salaries/${entry.citySlug}/${roleSlug}`}
                          className="text-xs text-teal-500 hover:text-teal-700 transition-colors flex items-center justify-end gap-1"
                        >
                          Details
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">
            Hire a {role.title} remotely and save {avgSavings}%
          </h2>
          <p className="text-teal-100 text-base mb-8 max-w-lg mx-auto">
            Generate a tailored {role.title} job description with AI, post it for free,
            and track every applicant in KiteHR&apos;s pipeline.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Post this role free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
