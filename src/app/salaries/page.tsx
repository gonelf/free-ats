import Link from "next/link";
import { ArrowRight, MapPin, Briefcase, TrendingDown } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { SALARY_CITIES, SALARY_ROLES, getAllCategories } from "./salary-data";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 3600; // 1-hour ISR

export const metadata: Metadata = {
  title: "Salary Guide: 5,000+ Role & City Benchmarks — KiteHR",
  description:
    "Free salary data for 100+ roles across 50 US and UK cities. See what you're paying locally vs. what a remote hire costs — and calculate your savings.",
};

const CATEGORY_ICONS: Record<string, string> = {
  Engineering: "⚙️",
  Product: "🗂️",
  Design: "🎨",
  Marketing: "📣",
  Sales: "💰",
  Finance: "📊",
  HR: "👥",
  Operations: "🔧",
  Legal: "⚖️",
};

export default async function SalariesIndexPage() {
  let publishedCitySlugs = new Set<string>();
  let publishedRoleSlugs = new Set<string>();
  try {
    const published = await db.salaryEntry.findMany({
      where: { publishedAt: { not: null } },
      select: { citySlug: true, roleSlug: true },
    });
    for (const e of published) {
      publishedCitySlugs.add(e.citySlug);
      publishedRoleSlugs.add(e.roleSlug);
    }
  } catch {
    // Table not yet migrated — fall through with empty sets
  }

  const categories = getAllCategories();
  const tier1Cities = SALARY_CITIES.filter((c) => c.tier === 1 && publishedCitySlugs.has(c.slug));
  const tier2Cities = SALARY_CITIES.filter((c) => c.tier === 2 && publishedCitySlugs.has(c.slug));
  const tier3Cities = SALARY_CITIES.filter((c) => c.tier === 3 && publishedCitySlugs.has(c.slug));

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav variant="light" />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-teal-700 mb-6">
            <TrendingDown className="h-3 w-3" />
            {publishedCitySlugs.size} Cities · {publishedRoleSlugs.size} Roles
          </div>
          <h1 className="font-heading font-black tracking-tight text-slate-900 text-4xl md:text-5xl mb-5">
            Salary Benchmarks &{" "}
            <span className="text-teal-700">Remote Savings Guide</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            See exactly what each role costs in your city — and how much you could save by
            hiring remote talent through KiteHR. Updated for 2025.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-7 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
          >
            Start hiring remote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* City Grid */}
      <section className="py-12 border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Browse by City</h2>
          <p className="text-sm text-slate-500 mb-8">
            Select a city to see all {publishedRoleSlugs.size} role benchmarks and savings data.
          </p>

          {/* Tier 1 */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">
              Top Markets
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {tier1Cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/salaries/${city.slug}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-200 hover:shadow-sm transition-all text-center group"
                >
                  <MapPin className="h-4 w-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                  <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 transition-colors">
                    {city.name}
                  </span>
                  <span className="text-xs text-slate-400">{city.state}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tier 2 */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Major Markets
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {tier2Cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/salaries/${city.slug}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-3 hover:border-teal-200 hover:shadow-sm transition-all text-center group"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {city.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {city.country === "UK" ? "🇬🇧" : "🇺🇸"} {city.state}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tier 3 */}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              All Other Markets
            </p>
            <div className="flex flex-wrap gap-2">
              {tier3Cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/salaries/${city.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Role Category */}
      <section className="py-12 border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Browse by Role</h2>
          <p className="text-sm text-slate-500 mb-8">
            {publishedRoleSlugs.size} roles across {categories.length} categories.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const roles = SALARY_ROLES.filter((r) => r.category === category && publishedRoleSlugs.has(r.slug));
              if (roles.length === 0) return null;
              return (
                <div
                  key={category}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{CATEGORY_ICONS[category] ?? "📋"}</span>
                    <h3 className="text-sm font-semibold text-slate-900">{category}</h3>
                    <span className="ml-auto text-xs text-slate-400">{roles.length} roles</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {roles.slice(0, 6).map((role) => (
                      <Link
                        key={role.slug}
                        href={`/salaries/roles/${role.slug}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 hover:text-teal-700 hover:border-teal-200 transition-all"
                      >
                        {role.title}
                      </Link>
                    ))}
                    {roles.length > 6 && (
                      <span className="rounded-full border border-slate-100 px-2.5 py-1 text-xs text-slate-300">
                        +{roles.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Briefcase className="h-8 w-8 text-teal-300 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Ready to reduce your hiring costs?
          </h2>
          <p className="text-teal-100 mb-8 text-base max-w-lg mx-auto">
            KiteHR connects you with vetted remote talent at a fraction of local rates.
            Generate a job description with AI and post your first role in minutes — free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-lg"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
