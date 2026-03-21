import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { seedDefaultFlags } from "@/lib/feature-flags";
import { FeatureFlagToggle } from "@/components/admin/FeatureFlagToggle";
import { Flag } from "lucide-react";

const ROLLOUT_BADGE: Record<string, { label: string; className: string }> = {
  DISABLED: { label: "Disabled", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  ADMINS: { label: "Admins only", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  EVERYONE: { label: "Everyone", className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

export default async function FeatureFlagsPage() {
  await requireAdmin();
  await seedDefaultFlags();

  const flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feature Flags</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Control who can access each feature. Changes take effect immediately.
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
          <Flag className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No feature flags defined yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Flag</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Key</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Audience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {flags.map((flag) => {
                  const badge = ROLLOUT_BADGE[flag.rollout] ?? ROLLOUT_BADGE.DISABLED;
                  return (
                    <tr key={flag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{flag.name}</td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs text-gray-700 dark:text-gray-300">
                          {flag.key}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-sm">
                        {flag.description ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            badge.className,
                          ].join(" ")}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <FeatureFlagToggle
                          flagKey={flag.key}
                          initialRollout={flag.rollout}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
