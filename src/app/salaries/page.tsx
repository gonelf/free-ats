import Link from "next/link";
import { ArrowRight, MapPin, Briefcase, TrendingDown } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import { SALARY_CITIES, SALARY_ROLES, getAllCategories } from "./salary-data";
import type { Metadata } from "next";

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

export default function SalariesIndexPage() {
  const categories = getAllCategories();
  const tier1Cities = SALARY_CITIES.filter((c) => c.tier === 1);
  const tier2Cities = SALARY_CITIES.filter((c) => c.tier === 2);
  const tier3Cities = SALARY_CITIES.filter((c) => c.tier === 3);

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
            <TrendingDown className="h-3.5 w-3.5" />
            {SALARY_CITIES.length} Cities · {SALARY_ROLES.length} Roles
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Salary Benchmarks &{" "}
            <span className="text-cyan-400">Remote Savings Guide</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            See exactly what each role costs in your city — and how much you could save by
            hiring remote talent through KiteHR. Updated for 2025.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Start hiring remote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* City Grid */}
      <section className="py-12 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-xl font-bold mb-2">Browse by City</h2>
          <p className="text-sm text-white/40 mb-8">
            Select a city to see all {SALARY_ROLES.length} role benchmarks and savings data.
          </p>

          {/* Tier 1 */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-3">
              Top Markets
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {tier1Cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/salaries/${city.slug}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/3 p-4 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-center group"
                >
                  <MapPin className="h-4 w-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    {city.name}
                  </span>
                  <span className="text-xs text-white/30">{city.state}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tier 2 */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
              Major Markets
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {tier2Cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/salaries/${city.slug}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/3 p-3 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-center group"
                >
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    {city.name}
                  </span>
                  <span className="text-xs text-white/25">
                    {city.country === "UK" ? "🇬🇧" : "🇺🇸"} {city.state}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tier 3 */}
          <div>
            <p className="text-xs font-semibold text-white/20 uppercase tracking-wider mb-3">
              All Other Markets
            </p>
            <div className="flex flex-wrap gap-2">
              {tier3Cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/salaries/${city.slug}`}
                  className="rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Role Category */}
      <section className="py-12 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-xl font-bold mb-2">Browse by Role</h2>
          <p className="text-sm text-white/40 mb-8">
            {SALARY_ROLES.length} roles across {categories.length} categories.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const roles = SALARY_ROLES.filter((r) => r.category === category);
              return (
                <div
                  key={category}
                  className="rounded-2xl border border-white/8 bg-white/3 p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{CATEGORY_ICONS[category] ?? "📋"}</span>
                    <h3 className="text-sm font-semibold text-white">{category}</h3>
                    <span className="ml-auto text-xs text-white/30">{roles.length} roles</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {roles.slice(0, 6).map((role) => (
                      <Link
                        key={role.slug}
                        href={`/salaries/roles/${role.slug}`}
                        className="rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-xs text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                      >
                        {role.title}
                      </Link>
                    ))}
                    {roles.length > 6 && (
                      <span className="rounded-full border border-white/8 px-2.5 py-1 text-xs text-white/20">
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
      <section className="py-16 border-t border-white/5">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/6 blur-[80px] rounded-full" />
          </div>
          <div className="relative">
            <Briefcase className="h-8 w-8 text-cyan-400/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">
              Ready to reduce your hiring costs?
            </h2>
            <p className="text-white/40 mb-6 text-sm max-w-lg mx-auto">
              KiteHR connects you with vetted remote talent at a fraction of local rates.
              Generate a job description with AI and post your first role in minutes — free.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
