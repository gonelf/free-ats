import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, TrendingDown } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { db } from "@/lib/db";
import {
  getCityBySlug,
  getAllCategories,
  SALARY_ROLES,
  formatSalary,
  getCityLabel,
} from "../salary-data";
import type { Metadata } from "next";

export const revalidate = 86400; // 24-hour ISR

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title: `${city.name} Salary Guide 2025 — 100+ Roles — KiteHR`,
    description: `Salary benchmarks for 100+ roles in ${city.name}, ${city.state}. See local vs. remote costs and calculate your hiring savings.`,
    alternates: {
      canonical: `/salaries/${citySlug}`,
    },
  };
}

export default async function CityHubPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return notFound();

  // Fetch all published entries for this city
  const entries = await db.salaryEntry.findMany({
    where: { citySlug, publishedAt: { not: null } },
    select: {
      roleSlug: true,
      roleName: true,
      category: true,
      localSalaryMedian: true,
      remoteSalaryMedian: true,
      savingsPercent: true,
      currency: true,
    },
    orderBy: { localSalaryMedian: "desc" },
  });

  if (entries.length === 0) return notFound();

  const avgSavings = Math.round(
    entries.reduce((s, e) => s + e.savingsPercent, 0) / entries.length
  );
  const avgSalary = Math.round(
    entries.reduce((s, e) => s + e.localSalaryMedian, 0) / entries.length
  );

  const categories = getAllCategories();

  // Group entries by category
  const byCategory: Record<string, typeof entries> = {};
  for (const entry of entries) {
    if (!byCategory[entry.category]) byCategory[entry.category] = [];
    byCategory[entry.category].push(entry);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
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
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-teal-600" />
            <span className="text-sm text-teal-700">{getCityLabel(city)}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-slate-900 mb-4">
            {city.name} Salary Guide 2025
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mb-8">
            Salary benchmarks for {entries.length} roles in {city.name}.
            See what you&apos;re paying locally vs. what a remote hire costs — and
            calculate your exact savings.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
              <p className="text-xs text-slate-400 mt-1">Roles covered</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-teal-700">
                {formatSalary(avgSalary, city.currency)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Avg local median</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{avgSavings}%</p>
              <p className="text-xs text-slate-400 mt-1">Avg remote savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Tables by Category */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl px-6 space-y-10">
          {categories
            .filter((cat) => byCategory[cat]?.length > 0)
            .map((cat) => (
              <div key={cat}>
                <h2 className="text-base font-semibold text-slate-900 mb-4">{cat}</h2>
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Role
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Local Median
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Remote
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                          Savings
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {byCategory[cat].map((entry, i) => (
                        <tr
                          key={entry.roleSlug}
                          className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                            i === byCategory[cat].length - 1 ? "border-b-0" : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {entry.roleName}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {formatSalary(entry.localSalaryMedian, entry.currency as "USD" | "GBP")}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-600">
                            {formatSalary(entry.remoteSalaryMedian, entry.currency as "USD" | "GBP")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                              <TrendingDown className="h-3 w-3" />
                              {entry.savingsPercent}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/salaries/${citySlug}/${entry.roleSlug}`}
                              className="text-xs text-teal-500 hover:text-teal-700 transition-colors flex items-center justify-end gap-1"
                            >
                              Details
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">
            Hiring in {city.name}? Cut costs with remote talent.
          </h2>
          <p className="text-teal-100 text-base mb-8 max-w-lg mx-auto">
            KiteHR gives you the tools to post roles, track candidates, and hire
            remote workers — completely free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Post your first remote role free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
