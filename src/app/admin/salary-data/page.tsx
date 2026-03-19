import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { SALARY_CITIES } from "@/app/salaries/salary-data";
import { SalaryPopulateForm } from "@/components/admin/SalaryPopulateForm";

export default async function SalaryDataPage() {
  await requireAdmin();

  const totalEntries = await db.salaryEntry.count();
  const publishedEntries = await db.salaryEntry.count({ where: { publishedAt: { not: null } } });
  const citiesPopulated = await db.salaryEntry
    .findMany({ select: { citySlug: true }, distinct: ["citySlug"] })
    .then((rows) => rows.length);

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

      <SalaryPopulateForm cities={cities} totalEntries={totalEntries} />
    </div>
  );
}
