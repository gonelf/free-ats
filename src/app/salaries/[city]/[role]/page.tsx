import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, TrendingDown, Sparkles, ExternalLink } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { db } from "@/lib/db";
import {
  getCityBySlug,
  getRoleBySlug,
  formatSalary,
  getCityLabel,
  SALARY_CITIES,
} from "../../salary-data";
import { SalaryBarChart } from "../../components/SalaryBarChart";
import { ArbitrageSavingsCalculator } from "../../components/ArbitrageSavingsCalculator";
import type { Metadata } from "next";

export const revalidate = 86400; // 24-hour ISR

type Props = { params: Promise<{ city: string; role: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, role: roleSlug } = await params;
  const city = getCityBySlug(citySlug);
  const role = getRoleBySlug(roleSlug);
  if (!city || !role) return {};

  const currency = city.currency === "GBP" ? "£" : "$";
  return {
    title: `${role.title} Salary in ${city.name} ${new Date().getFullYear()} — KiteHR`,
    description: `${role.title} salary in ${city.name}: see the P25/P50/P75 range, total employer cost, and how much you could save hiring remote via KiteHR.`,
    alternates: {
      canonical: `/salaries/${citySlug}/${roleSlug}`,
    },
    openGraph: {
      title: `${role.title} Salary in ${city.name} ${new Date().getFullYear()}`,
      description: `What does a ${role.title} cost in ${city.name}? Compare local vs remote and calculate your ${currency} savings.`,
    },
  };
}

export default async function SalaryLeafPage({ params }: Props) {
  const { city: citySlug, role: roleSlug } = await params;

  const city = getCityBySlug(citySlug);
  const roleData = getRoleBySlug(roleSlug);

  if (!city || !roleData) return notFound();

  // Fetch the salary entry — 404 if not yet published
  const entry = await db.salaryEntry.findUnique({
    where: { citySlug_roleSlug: { citySlug, roleSlug } },
  });
  if (!entry || !entry.publishedAt) return notFound();

  // Related roles — same city, same category, published
  const relatedRoleEntries = await db.salaryEntry.findMany({
    where: {
      citySlug,
      roleSlug: { not: roleSlug },
      category: entry.category,
      publishedAt: { not: null },
    },
    select: { roleSlug: true, roleName: true, localSalaryMedian: true, currency: true },
    orderBy: { localSalaryMedian: "desc" },
    take: 5,
  });

  // Related cities — same role, published, sort by salary desc
  const relatedCityEntries = await db.salaryEntry.findMany({
    where: {
      roleSlug,
      citySlug: { not: citySlug },
      publishedAt: { not: null },
    },
    select: { citySlug: true, cityName: true, stateName: true, localSalaryMedian: true, currency: true },
    orderBy: { localSalaryMedian: "desc" },
    take: 5,
  });

  // Total employer cost estimate (salary + ~30% benefits/overhead)
  const employerCostLocal = Math.round(entry.localSalaryMedian * 1.3);
  const employerCostRemote = Math.round(entry.remoteSalaryMedian * 1.15); // Remote has lower overhead
  const totalEmployerSavings = employerCostLocal - employerCostRemote;
  const currency = entry.currency as "USD" | "GBP";

  // JSON-LD — JobPosting + BreadcrumbList + Dataset
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Salary Guide", item: "https://kitehr.co/salaries" },
          { "@type": "ListItem", position: 2, name: city.name, item: `https://kitehr.co/salaries/${citySlug}` },
          { "@type": "ListItem", position: 3, name: `${entry.roleName} Salary`, item: `https://kitehr.co/salaries/${citySlug}/${roleSlug}` },
        ],
      },
      {
        "@type": "JobPosting",
        title: entry.roleName,
        description: `Salary benchmark for ${entry.roleName} in ${city.name}. Median annual salary: ${formatSalary(entry.localSalaryMedian, currency)}.`,
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: city.name,
            addressRegion: city.state,
            addressCountry: city.country,
          },
        },
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: entry.currency,
          value: {
            "@type": "QuantitativeValue",
            minValue: entry.localSalaryLow,
            maxValue: entry.localSalaryHigh,
            value: entry.localSalaryMedian,
            unitText: "YEAR",
          },
        },
        employmentType: "FULL_TIME",
        datePosted: entry.publishedAt?.toISOString().split("T")[0],
        validThrough: entry.publishedAt
          ? new Date(new Date(entry.publishedAt).setFullYear(new Date(entry.publishedAt).getFullYear() + 1)).toISOString().split("T")[0]
          : undefined,
        hiringOrganization: {
          "@type": "Organization",
          name: "KiteHR",
          sameAs: "https://kitehr.co",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the average ${entry.roleName} salary in ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `The median ${entry.roleName} salary in ${city.name} is ${formatSalary(entry.localSalaryMedian, currency)} per year. The range spans from ${formatSalary(entry.localSalaryLow, currency)} (P25) to ${formatSalary(entry.localSalaryHigh, currency)} (P75).`,
            },
          },
          {
            "@type": "Question",
            name: `How much can I save hiring a remote ${entry.roleName} instead of a ${city.name}-based hire?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `You can save approximately ${entry.savingsPercent}% — or ${formatSalary(entry.annualSavings, currency)} annually — by hiring a remote ${entry.roleName} compared to a local ${city.name} hire. Remote talent typically earns ${formatSalary(entry.remoteSalaryMedian, currency)} median vs ${formatSalary(entry.localSalaryMedian, currency)} locally.`,
            },
          },
          {
            "@type": "Question",
            name: `What is the total employer cost for a ${entry.roleName} in ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `The total employer cost (salary + benefits + overhead) for a ${entry.roleName} in ${city.name} is approximately ${formatSalary(employerCostLocal, currency)} per year. A remote hire reduces this to roughly ${formatSalary(employerCostRemote, currency)}.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
            <Link href="/salaries" className="hover:text-slate-600 transition-colors">
              Salary Guide
            </Link>
            <span>/</span>
            <Link href={`/salaries/${citySlug}`} className="hover:text-slate-600 transition-colors">
              {city.name}
            </Link>
            <span>/</span>
            <span className="text-slate-500">{entry.roleName}</span>
          </nav>

          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-sm text-teal-600">{getCityLabel(city)}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-slate-900 mb-4">
            {entry.roleName} Salary in {city.name}
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mb-8">
            Median salary for a {entry.roleName} in {city.name} is{" "}
            <strong className="text-slate-900">{formatSalary(entry.localSalaryMedian, currency)}</strong>{" "}
            per year. Hire remotely via KiteHR and save{" "}
            <strong className="text-emerald-600">{entry.savingsPercent}%</strong> — or{" "}
            <strong className="text-emerald-600">{formatSalary(entry.annualSavings, currency)}</strong> annually.
          </p>

          {/* Key numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-1">Local Median</p>
              <p className="text-xl font-bold text-teal-700">{formatSalary(entry.localSalaryMedian, currency)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-1">Remote Median</p>
              <p className="text-xl font-bold text-emerald-600">{formatSalary(entry.remoteSalaryMedian, currency)}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-slate-400 mb-1">You Save</p>
              <p className="text-xl font-bold text-emerald-600">{entry.savingsPercent}%</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-1">Annual Savings</p>
              <p className="text-xl font-bold text-slate-900">{formatSalary(entry.annualSavings, currency)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: charts & tables */}
            <div className="lg:col-span-2 space-y-8">

              {/* Bar chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-6">
                  Local vs. Remote Salary Comparison
                </h2>
                <SalaryBarChart
                  localLow={entry.localSalaryLow}
                  localMedian={entry.localSalaryMedian}
                  localHigh={entry.localSalaryHigh}
                  remoteLow={entry.remoteSalaryLow}
                  remoteMedian={entry.remoteSalaryMedian}
                  remoteHigh={entry.remoteSalaryHigh}
                  currency={currency}
                />
              </div>

              {/* Salary breakdown table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">
                  Salary Percentile Breakdown
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Percentile</th>
                      <th className="text-right pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Local ({city.name})</th>
                      <th className="text-right pb-3 text-xs font-semibold text-emerald-600 uppercase tracking-wide">Remote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 text-slate-500">P25 — Entry level</td>
                      <td className="py-3 text-right text-slate-600">{formatSalary(entry.localSalaryLow, currency)}</td>
                      <td className="py-3 text-right text-emerald-600">{formatSalary(entry.remoteSalaryLow, currency)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-600 font-medium">P50 — Median</td>
                      <td className="py-3 text-right font-semibold text-teal-700">{formatSalary(entry.localSalaryMedian, currency)}</td>
                      <td className="py-3 text-right font-semibold text-emerald-600">{formatSalary(entry.remoteSalaryMedian, currency)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-500">P75 — Senior / Lead</td>
                      <td className="py-3 text-right text-slate-600">{formatSalary(entry.localSalaryHigh, currency)}</td>
                      <td className="py-3 text-right text-emerald-600">{formatSalary(entry.remoteSalaryHigh, currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total employer cost */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-2">
                  Total Employer Cost
                </h2>
                <p className="text-xs text-slate-400 mb-5">
                  Salary + estimated benefits, payroll taxes, and overhead (30% local / 15% remote).
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-400 mb-1">In-person in {city.name}</p>
                    <p className="text-2xl font-bold text-slate-900">{formatSalary(employerCostLocal, currency)}</p>
                    <p className="text-xs text-slate-400 mt-1">/year total cost</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs text-slate-400 mb-1">Remote via KiteHR</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatSalary(employerCostRemote, currency)}</p>
                    <p className="text-xs text-slate-400 mt-1">/year total cost</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total employer savings</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {formatSalary(totalEmployerSavings, currency)}/yr
                  </span>
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1.5">
                      What is the average {entry.roleName} salary in {city.name}?
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      The median {entry.roleName} salary in {city.name} is{" "}
                      {formatSalary(entry.localSalaryMedian, currency)} per year. Entry-level roles
                      start around {formatSalary(entry.localSalaryLow, currency)}, while senior or
                      lead-level {entry.roleName}s can earn up to{" "}
                      {formatSalary(entry.localSalaryHigh, currency)}. Data reflects {entry.dataYear}{" "}
                      market rates sourced from BLS OES, DOL H-1B LCA disclosures, and KiteHR market research.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1.5">
                      How much can I save hiring a remote {entry.roleName}?
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Hiring a remote {entry.roleName} vs. a {city.name}-based hire saves approximately{" "}
                      {entry.savingsPercent}% — or {formatSalary(entry.annualSavings, currency)} per year.
                      Remote {entry.category} professionals typically earn{" "}
                      {formatSalary(entry.remoteSalaryMedian, currency)} median, compared to the local{" "}
                      {city.name} rate of {formatSalary(entry.localSalaryMedian, currency)}.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1.5">
                      Is it common to hire a remote {entry.roleName}?
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Yes — {entry.category} roles like {entry.roleName} have a high degree of
                      remote compatibility. Latin America, Eastern Europe, and Southeast Asia have
                      deep talent pools for this category. KiteHR can help you post the role,
                      screen candidates, and manage the hiring pipeline entirely online.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1.5">
                      What is the total employer cost for a {entry.roleName} in {city.name}?
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      The total employer cost — including salary, payroll taxes, health benefits,
                      and overhead — for a {entry.roleName} in {city.name} is approximately{" "}
                      {formatSalary(employerCostLocal, currency)} per year. Hiring remote reduces this
                      to roughly {formatSalary(employerCostRemote, currency)}, saving{" "}
                      {formatSalary(totalEmployerSavings, currency)} annually.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Savings calculator */}
              <ArbitrageSavingsCalculator
                annualSavingsPerRole={entry.annualSavings}
                currency={currency}
                roleTitle={entry.roleName}
                cityName={city.name}
              />

              {/* AI JD CTA */}
              <div className="rounded-2xl border-2 border-teal-600 bg-teal-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-teal-700 shrink-0" />
                  <h3 className="text-sm font-semibold text-teal-700">Ready to hire?</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Generate a {entry.roleName} job description with AI, post it, and start
                  receiving remote applicants — all for free.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors w-full"
                >
                  Generate JD with AI
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Demand level */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Role Insights</h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Demand in {city.name}</dt>
                    <dd className={`font-medium capitalize ${
                      entry.demandLevel === "high"
                        ? "text-red-600"
                        : entry.demandLevel === "medium"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}>
                      {entry.demandLevel}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Category</dt>
                    <dd className="text-slate-600">{entry.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Data year</dt>
                    <dd className="text-slate-600">{entry.dataYear}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Currency</dt>
                    <dd className="text-slate-600">{entry.currency}</dd>
                  </div>
                </dl>
              </div>

              {/* Related roles in this city */}
              {relatedRoleEntries.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Other {entry.category} Roles in {city.name}
                  </h3>
                  <ul className="space-y-2">
                    {relatedRoleEntries.map((r) => (
                      <li key={r.roleSlug}>
                        <Link
                          href={`/salaries/${citySlug}/${r.roleSlug}`}
                          className="flex items-center justify-between text-xs hover:text-teal-700 transition-colors group"
                        >
                          <span className="text-slate-500 group-hover:text-teal-700">{r.roleName}</span>
                          <span className="text-slate-400">
                            {formatSalary(r.localSalaryMedian, r.currency as "USD" | "GBP")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data source */}
              <p className="text-xs text-slate-400 leading-relaxed px-1">
                Data sourced from BLS OES, DOL H-1B LCA disclosures, and KiteHR market
                research. Figures are estimates and may vary by company, seniority, and
                experience level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Same role in other cities */}
      {relatedCityEntries.length > 0 && (
        <section className="py-10 border-b border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              {entry.roleName} Salary in Other Cities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedCityEntries.map((c) => (
                <Link
                  key={c.citySlug}
                  href={`/salaries/${c.citySlug}/${roleSlug}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-200 hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-medium text-slate-600 group-hover:text-slate-900 mb-1">
                    {c.cityName}
                  </p>
                  <p className="text-xs text-slate-400">{c.stateName}</p>
                  <p className="text-sm font-bold text-teal-700 mt-2">
                    {formatSalary(c.localSalaryMedian, c.currency as "USD" | "GBP")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-20 bg-teal-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500 bg-teal-600 px-4 py-1.5 text-sm font-medium text-white mb-5">
            <TrendingDown className="h-3.5 w-3.5" />
            Save {entry.savingsPercent}% on every {entry.roleName} hire
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Stop overpaying for {entry.roleName}s in {city.name}
          </h2>
          <p className="text-teal-200 mb-6 text-sm max-w-lg mx-auto">
            Post a remote {entry.roleName} role on KiteHR, track applicants with AI-powered
            tools, and make your first hire — all for free.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-colors"
            >
              Post this role free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/salaries/${citySlug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-500 bg-teal-600 px-7 py-3 text-sm font-bold text-white hover:bg-teal-500 transition-colors"
            >
              All salaries in {city.name}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
