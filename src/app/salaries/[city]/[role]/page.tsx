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
    title: `${role.title} Salary in ${city.name} 2025 — KiteHR`,
    description: `${role.title} salary in ${city.name}: see the P25/P50/P75 range, total employer cost, and how much you could save hiring remote via KiteHR.`,
    openGraph: {
      title: `${role.title} Salary in ${city.name} 2025`,
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
        validThrough: `${entry.dataYear + 1}-01-01`,
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
    <div className="min-h-screen bg-[#080c10] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/salaries" className="hover:text-white/60 transition-colors">
              Salary Guide
            </Link>
            <span>/</span>
            <Link href={`/salaries/${citySlug}`} className="hover:text-white/60 transition-colors">
              {city.name}
            </Link>
            <span>/</span>
            <span className="text-white/50">{entry.roleName}</span>
          </nav>

          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-sm text-cyan-400">{getCityLabel(city)}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {entry.roleName} Salary in {city.name}
          </h1>
          <p className="text-base text-white/50 max-w-2xl mb-8">
            Median salary for a {entry.roleName} in {city.name} is{" "}
            <strong className="text-white">{formatSalary(entry.localSalaryMedian, currency)}</strong>{" "}
            per year. Hire remotely via KiteHR and save{" "}
            <strong className="text-emerald-400">{entry.savingsPercent}%</strong> — or{" "}
            <strong className="text-emerald-400">{formatSalary(entry.annualSavings, currency)}</strong> annually.
          </p>

          {/* Key numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs text-white/40 mb-1">Local Median</p>
              <p className="text-xl font-bold text-cyan-400">{formatSalary(entry.localSalaryMedian, currency)}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs text-white/40 mb-1">Remote Median</p>
              <p className="text-xl font-bold text-emerald-400">{formatSalary(entry.remoteSalaryMedian, currency)}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs text-white/40 mb-1">You Save</p>
              <p className="text-xl font-bold text-emerald-400">{entry.savingsPercent}%</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs text-white/40 mb-1">Annual Savings</p>
              <p className="text-xl font-bold text-white">{formatSalary(entry.annualSavings, currency)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: charts & tables */}
            <div className="lg:col-span-2 space-y-8">

              {/* Bar chart */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h2 className="text-base font-semibold text-white mb-6">
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
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h2 className="text-base font-semibold text-white mb-4">
                  Salary Percentile Breakdown
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left pb-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Percentile</th>
                      <th className="text-right pb-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Local ({city.name})</th>
                      <th className="text-right pb-3 text-xs font-semibold text-emerald-400/60 uppercase tracking-wide">Remote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 text-white/60">P25 — Entry level</td>
                      <td className="py-3 text-right text-white/70">{formatSalary(entry.localSalaryLow, currency)}</td>
                      <td className="py-3 text-right text-emerald-400/70">{formatSalary(entry.remoteSalaryLow, currency)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white/60 font-medium">P50 — Median</td>
                      <td className="py-3 text-right font-semibold text-cyan-400">{formatSalary(entry.localSalaryMedian, currency)}</td>
                      <td className="py-3 text-right font-semibold text-emerald-400">{formatSalary(entry.remoteSalaryMedian, currency)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white/60">P75 — Senior / Lead</td>
                      <td className="py-3 text-right text-white/70">{formatSalary(entry.localSalaryHigh, currency)}</td>
                      <td className="py-3 text-right text-emerald-400/70">{formatSalary(entry.remoteSalaryHigh, currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total employer cost */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h2 className="text-base font-semibold text-white mb-2">
                  Total Employer Cost
                </h2>
                <p className="text-xs text-white/40 mb-5">
                  Salary + estimated benefits, payroll taxes, and overhead (30% local / 15% remote).
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                    <p className="text-xs text-white/40 mb-1">In-person in {city.name}</p>
                    <p className="text-2xl font-bold text-white">{formatSalary(employerCostLocal, currency)}</p>
                    <p className="text-xs text-white/30 mt-1">/year total cost</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs text-white/40 mb-1">Remote via KiteHR</p>
                    <p className="text-2xl font-bold text-emerald-400">{formatSalary(employerCostRemote, currency)}</p>
                    <p className="text-xs text-white/30 mt-1">/year total cost</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-white/60">Total employer savings</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {formatSalary(totalEmployerSavings, currency)}/yr
                  </span>
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-5">
                <h2 className="text-base font-semibold text-white">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1.5">
                      What is the average {entry.roleName} salary in {city.name}?
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      The median {entry.roleName} salary in {city.name} is{" "}
                      {formatSalary(entry.localSalaryMedian, currency)} per year. Entry-level roles
                      start around {formatSalary(entry.localSalaryLow, currency)}, while senior or
                      lead-level {entry.roleName}s can earn up to{" "}
                      {formatSalary(entry.localSalaryHigh, currency)}. Data reflects {entry.dataYear}{" "}
                      market rates sourced from BLS OES, DOL H-1B LCA disclosures, and KiteHR market research.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1.5">
                      How much can I save hiring a remote {entry.roleName}?
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Hiring a remote {entry.roleName} vs. a {city.name}-based hire saves approximately{" "}
                      {entry.savingsPercent}% — or {formatSalary(entry.annualSavings, currency)} per year.
                      Remote {entry.category} professionals typically earn{" "}
                      {formatSalary(entry.remoteSalaryMedian, currency)} median, compared to the local{" "}
                      {city.name} rate of {formatSalary(entry.localSalaryMedian, currency)}.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1.5">
                      Is it common to hire a remote {entry.roleName}?
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Yes — {entry.category} roles like {entry.roleName} have a high degree of
                      remote compatibility. Latin America, Eastern Europe, and Southeast Asia have
                      deep talent pools for this category. KiteHR can help you post the role,
                      screen candidates, and manage the hiring pipeline entirely online.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1.5">
                      What is the total employer cost for a {entry.roleName} in {city.name}?
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
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
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-cyan-300">Ready to hire?</h3>
                </div>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Generate a {entry.roleName} job description with AI, post it, and start
                  receiving remote applicants — all for free.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors w-full"
                >
                  Generate JD with AI
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Demand level */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Role Insights</h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-white/40">Demand in {city.name}</dt>
                    <dd className={`font-medium capitalize ${
                      entry.demandLevel === "high"
                        ? "text-red-400"
                        : entry.demandLevel === "medium"
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}>
                      {entry.demandLevel}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Category</dt>
                    <dd className="text-white/60">{entry.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Data year</dt>
                    <dd className="text-white/60">{entry.dataYear}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Currency</dt>
                    <dd className="text-white/60">{entry.currency}</dd>
                  </div>
                </dl>
              </div>

              {/* Related roles in this city */}
              {relatedRoleEntries.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Other {entry.category} Roles in {city.name}
                  </h3>
                  <ul className="space-y-2">
                    {relatedRoleEntries.map((r) => (
                      <li key={r.roleSlug}>
                        <Link
                          href={`/salaries/${citySlug}/${r.roleSlug}`}
                          className="flex items-center justify-between text-xs hover:text-cyan-400 transition-colors group"
                        >
                          <span className="text-white/60 group-hover:text-cyan-400">{r.roleName}</span>
                          <span className="text-white/30">
                            {formatSalary(r.localSalaryMedian, r.currency as "USD" | "GBP")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data source */}
              <p className="text-xs text-white/20 leading-relaxed px-1">
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
        <section className="py-10 border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-base font-semibold text-white mb-5">
              {entry.roleName} Salary in Other Cities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedCityEntries.map((c) => (
                <Link
                  key={c.citySlug}
                  href={`/salaries/${c.citySlug}/${roleSlug}`}
                  className="rounded-xl border border-white/8 bg-white/3 p-4 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
                >
                  <p className="text-sm font-medium text-white/70 group-hover:text-white mb-1">
                    {c.cityName}
                  </p>
                  <p className="text-xs text-white/30">{c.stateName}</p>
                  <p className="text-sm font-bold text-cyan-400 mt-2">
                    {formatSalary(c.localSalaryMedian, c.currency as "USD" | "GBP")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/6 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-5">
              <TrendingDown className="h-3.5 w-3.5" />
              Save {entry.savingsPercent}% on every {entry.roleName} hire
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Stop overpaying for {entry.roleName}s in {city.name}
            </h2>
            <p className="text-white/40 mb-6 text-sm max-w-lg mx-auto">
              Post a remote {entry.roleName} role on KiteHR, track applicants with AI-powered
              tools, and make your first hire — all for free.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Post this role free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/salaries/${citySlug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white/60 hover:bg-white/10 transition-colors"
              >
                All salaries in {city.name}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
