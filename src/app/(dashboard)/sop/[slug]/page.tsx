import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Clock, RefreshCw, Users } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

type SopStep = {
  step: number;
  title: string;
  description: string;
  tips?: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  hiring: "Hiring Process",
  "hr-ops": "HR Operations",
  compliance: "Compliance",
  onboarding: "Onboarding",
  manager: "Manager & Team",
  benefits: "Benefits & Payroll",
  international: "International & Scaling",
};

export default async function SopDetailDashboardPage({ params }: Props) {
  const { slug } = await params;

  let sop;
  try {
    sop = await db.generatedSop.findUnique({ where: { slug } });
  } catch {
    return notFound();
  }

  if (!sop || !sop.publishedAt) return notFound();

  const steps = sop.steps as SopStep[];

  let relatedSops: { slug: string; title: string }[] = [];
  if (sop.relatedSlugs.length > 0) {
    try {
      relatedSops = await db.generatedSop.findMany({
        where: { slug: { in: sop.relatedSlugs }, publishedAt: { not: null } },
        select: { slug: true, title: true },
        take: 4,
      });
    } catch {
      // Non-fatal
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/sop"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          SOP Library
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/10 dark:ring-indigo-400/20 mb-3">
              {CATEGORY_LABELS[sop.category] ?? sop.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sop.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">{sop.description}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {sop.estimatedTime}
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            {sop.frequency}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {sop.responsibleRoles.join(", ")}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purpose & Scope */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                Purpose
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{sop.purpose}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                Scope
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{sop.scope}</p>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Steps ({steps.length})
            </h2>
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                      {step.tips && step.tips.length > 0 && (
                        <ul className="mt-2.5 space-y-1">
                          {step.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 items-start text-xs text-gray-400 dark:text-gray-500">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick reference */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Reference
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Frequency</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{sop.frequency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Time Required</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{sop.estimatedTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Responsible</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sop.responsibleRoles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related SOPs */}
          {relatedSops.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Related SOPs
              </h3>
              <ul className="space-y-2">
                {relatedSops.map((related) => (
                  <li key={related.slug}>
                    <Link
                      href={`/sop/${related.slug}`}
                      className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    >
                      <ArrowLeft className="h-3 w-3 shrink-0 rotate-180 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
