import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { SopPopulateForm } from "@/components/admin/SopPopulateForm";

export default async function SopLibraryPage() {
  await requireAdmin();

  let totalInDb = 0;
  let publishedCount = 0;
  let byPhase: { phase: number; _count: { _all: number } }[] = [];

  try {
    totalInDb = await db.generatedSop.count();
    publishedCount = await db.generatedSop.count({ where: { publishedAt: { not: null } } });
    byPhase = await db.generatedSop.groupBy({
      by: ["phase"],
      _count: { _all: true },
      orderBy: { phase: "asc" },
    });
  } catch {
    // Table not yet migrated — show zero state
  }

  const TOTAL_PLANNED = 95; // phases 2–6

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SOP Library</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Generate SOP content using Gemini AI from the SOP_CONTENT_PLAN.md plan file, then publish in batches via cron.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total in DB", value: totalInDb.toString() },
          { label: "Published", value: publishedCount.toString() },
          { label: "Unpublished", value: (totalInDb - publishedCount).toString() },
          { label: "Remaining to generate", value: `${Math.max(0, TOTAL_PLANNED - totalInDb)} / ${TOTAL_PLANNED}` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Phase breakdown */}
      {byPhase.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">By phase</h2>
          <div className="flex flex-wrap gap-3">
            {byPhase.map((p) => (
              <div
                key={p.phase}
                className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">Phase {p.phase}</span>
                <span className="ml-2 text-gray-400">{p._count._all} SOPs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SopPopulateForm totalInDb={totalInDb} publishedCount={publishedCount} />
    </div>
  );
}
