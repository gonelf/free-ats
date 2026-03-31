import { db } from "@/lib/db";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";

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
      <PageHeader
        title="SOP Library"
        subtitle="Standard operating procedures for every hiring and HR process"
        action={
          sops.length > 0 ? (
            <span className="text-sm text-gray-400 dark:text-gray-500">{sops.length} SOPs</span>
          ) : undefined
        }
      />

      {sops.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
          title="SOPs coming soon"
          description="Our SOP library is being built. Check back soon — or browse our free templates in the meantime."
          action={
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
          }
        />
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
