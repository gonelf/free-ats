import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { SALARY_CITIES } from "@/app/salaries/salary-data";
import { SalaryPopulateForm } from "@/components/admin/SalaryPopulateForm";

export default async function SalaryDataPage() {
  await requireAdmin();

  const totalEntries = await db.salaryEntry.count();
  const publishedEntries = await db.salaryEntry.count({ where: { publishedAt: { not: null } } });
  const populatedCitySlugs = await db.salaryEntry
    .findMany({ select: { citySlug: true }, distinct: ["citySlug"] })
    .then((rows) => new Set(rows.map((r) => r.citySlug)));

  const citiesPopulated = populatedCitySlugs.size;

  const tierStats = ([1, 2, 3] as const).map((t) => {
    const tierCities = SALARY_CITIES.filter((c) => c.tier === t);
    const populated = tierCities.filter((c) => populatedCitySlugs.has(c.slug)).length;
    return { tier: t, populated, total: tierCities.length };
  });

  const cities = SALARY_CITIES.map((c) => ({ slug: c.slug, name: c.name, tier: c.tier }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Salary Data</h1>
        <p className="text-sm text-gray-500 mt-1">
          Populate the salary database using Gemini AI calibrated to BLS/H-1B benchmarks.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total entries", value: totalEntries.toLocaleString() },
          { label: "Published", value: publishedEntries.toLocaleString() },
          { label: "Cities populated", value: `${citiesPopulated} / ${SALARY_CITIES.length}` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-tier stats */}
      <div className="grid grid-cols-3 gap-4">
        {tierStats.map(({ tier, populated, total }) => {
          const pct = total > 0 ? Math.round((populated / total) * 100) : 0;
          return (
            <div key={tier} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Tier {tier}</span>
                <span className="text-xs text-gray-500">{populated} / {total} cities</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-gray-900 h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">{pct}% populated</div>
            </div>
          );
        })}
      </div>

      <SalaryPopulateForm cities={cities} totalEntries={totalEntries} />
    </div>
  );
}
