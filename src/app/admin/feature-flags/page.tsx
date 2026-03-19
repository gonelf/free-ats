import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { seedDefaultFlags } from "@/lib/feature-flags";
import { FeatureFlagToggle } from "@/components/admin/FeatureFlagToggle";
import { Flag } from "lucide-react";

export default async function FeatureFlagsPage() {
  await requireAdmin();
  await seedDefaultFlags();

  const flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enable or disable features across the platform. Changes take effect immediately.
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Flag className="mx-auto h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No feature flags defined yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left font-medium text-gray-500">Flag</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Key</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Description</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{flag.name}</td>
                  <td className="px-6 py-4">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
                      {flag.key}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-sm">
                    {flag.description ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        flag.enabled
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      ].join(" ")}
                    >
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <FeatureFlagToggle
                      flagKey={flag.key}
                      initialEnabled={flag.enabled}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
