import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { MessageSquare, Bug, Lightbulb, ThumbsUp } from "lucide-react";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function RequestsPage() {
  await requireAdmin();

  const feedbacks = await db.feedback.findMany({
    orderBy: { votes: "desc" },
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  const features = feedbacks.filter((f) => f.type === "FEATURE");
  const bugs = feedbacks.filter((f) => f.type === "BUG");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Feature & Bug Requests
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All user-submitted feature requests and bug reports across the platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 flex items-center gap-4">
          <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-900/30">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{features.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Feature Requests</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 flex items-center gap-4">
          <div className="rounded-lg p-2 bg-red-50 dark:bg-red-900/30">
            <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{bugs.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bug Reports</div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Feature Requests */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Feature Requests
            </h2>
            <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
              {features.length}
            </span>
          </div>

          {features.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-12 text-center">
              <Lightbulb className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No feature requests yet</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Organization</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Submitted by</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Votes</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {features.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-sm truncate">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {item.organization.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          {item.userEmail}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="font-medium">{item.votes}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Bug Reports */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bug Reports
            </h2>
            <span className="ml-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
              {bugs.length}
            </span>
          </div>

          {bugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-12 text-center">
              <Bug className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No bug reports yet</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Organization</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Submitted by</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Votes</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {bugs.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-sm truncate">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {item.organization.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          {item.userEmail}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="font-medium">{item.votes}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
