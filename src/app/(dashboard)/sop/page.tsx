import { db } from "@/lib/db";
import { ArrowRight, FileText, Search } from "lucide-react";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  hiring: "Hiring Process",
  "hr-ops": "HR Operations",
  compliance: "Compliance",
  onboarding: "Onboarding",
  manager: "Manager & Team",
  benefits: "Benefits & Payroll",
  international: "International & Scaling",
};

export default async function SopLibraryDashboardPage() {
  let sops: { slug: string; title: string; category: string; description: string; estimatedTime: string; frequency: string }[] = [];

  try {
    sops = await db.generatedSop.findMany({
      where: { publishedAt: { not: null } },
      select: {
        slug: true,
        title: true,
        category: true,
        description: true,
        estimatedTime: true,
        frequency: true,
      },
      orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
    });
  } catch {
    // Table not yet migrated
  }

  const categories = Object.keys(CATEGORY_LABELS).filter((cat) =>
    sops.some((s) => s.category === cat)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SOP Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Standard operating procedures for every hiring and HR process
          </p>
        </div>
        {sops.length > 0 && (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {sops.length} SOPs
          </span>
        )}
      </div>

      {sops.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-16">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">SOPs coming soon</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6 text-center max-w-sm">
            Our SOP library is being built. Check back soon — or browse our free templates in the meantime.
          </p>
          <div className="flex gap-3">
            <Link
              href="/hr-email-templates"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Email templates
            </Link>
            <Link
              href="/interview-questions"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Interview questions
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map((category) => {
            const items = sops.filter((s) => s.category === category);
            return (
              <div key={category}>
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {CATEGORY_LABELS[category] ?? category}
                  <span className="ml-2 font-normal normal-case text-gray-300 dark:text-gray-600">
                    {items.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {items.map((sop) => (
                    <Link
                      key={sop.slug}
                      href={`/sop/${sop.slug}`}
                      className="group flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {sop.title}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                          {sop.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500">
                          {sop.estimatedTime}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
