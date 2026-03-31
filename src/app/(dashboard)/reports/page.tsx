import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { BarChart3, Users, Briefcase, TrendingUp, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports — KiteHR",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    select: { organizationId: true },
  });

  const orgId = member.organizationId;

  // Fetch all data in parallel
  const [jobs, candidates, applications, pipeline] = await Promise.all([
    db.job.findMany({
      where: { organizationId: orgId },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    db.candidate.findMany({
      where: { organizationId: orgId },
      select: { id: true, createdAt: true },
    }),
    db.application.findMany({
      where: { job: { organizationId: orgId } },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        stageId: true,
        stage: { select: { name: true, color: true } },
        job: { select: { title: true } },
      },
    }),
    db.pipeline.findFirst({
      where: { organizationId: orgId, isDefault: true },
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
    }),
  ]);

  // Aggregate stats
  const openJobs = jobs.filter((j) => j.status === "OPEN").length;
  const draftJobs = jobs.filter((j) => j.status === "DRAFT").length;
  const closedJobs = jobs.filter((j) => j.status === "CLOSED").length;

  // Candidates per stage
  const stageCounts: Record<string, { name: string; color: string; count: number }> = {};
  for (const app of applications) {
    const key = app.stageId;
    if (!stageCounts[key]) {
      stageCounts[key] = {
        name: app.stage.name,
        color: app.stage.color,
        count: 0,
      };
    }
    stageCounts[key].count++;
  }

  // Sort stages by pipeline order
  const stagesOrdered = pipeline?.stages ?? [];
  const stageData = stagesOrdered.map((s) => ({
    name: s.name,
    color: s.color,
    count: stageCounts[s.id]?.count ?? 0,
  }));

  // Candidates per job (top 5)
  const jobCountMap: Record<string, { title: string; count: number }> = {};
  for (const app of applications) {
    if (!jobCountMap[app.job.title]) {
      jobCountMap[app.job.title] = { title: app.job.title, count: 0 };
    }
    jobCountMap[app.job.title].count++;
  }
  const topJobs = Object.values(jobCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hired candidates (in "Hired" stage)
  const hiredCount = stageData.find((s) => s.name === "Hired")?.count ?? 0;

  // Avg time-in-pipeline: diff between oldest and newest application updatedAt per application
  // Simplified: avg days from application creation to now for active applications
  const now = Date.now();
  const avgDaysInPipeline =
    applications.length > 0
      ? Math.round(
        applications.reduce(
          (sum, a) =>
            sum + (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24),
          0
        ) / applications.length
      )
      : 0;

  const maxStageCount = Math.max(...stageData.map((s) => s.count), 1);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Hiring pipeline at a glance</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-teal-600" />}
          label="Open Jobs"
          value={openJobs}
          sub={`${draftJobs} draft · ${closedJobs} closed`}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-teal-600" />}
          label="Total Candidates"
          value={candidates.length}
          sub={`${applications.length} active applications`}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          label="Hired"
          value={hiredCount}
          sub="moved to Hired stage"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          label="Avg. Days in Pipeline"
          value={avgDaysInPipeline}
          sub="from application date"
        />
      </div>

      {/* Candidates per stage */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Candidates per stage
        </h2>
        {stageData.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No pipeline data yet.</p>
        ) : (
          <div className="space-y-4">
            {stageData.map((stage) => (
              <div key={stage.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{stage.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stage.count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(stage.count / maxStageCount) * 100}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top jobs by applications */}
      {topJobs.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Top jobs by applications
          </h2>
          <ul className="space-y-3">
            {topJobs.map((job) => (
              <li
                key={job.title}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs">{job.title}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                  {job.count} application{job.count !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {applications.length === 0 && (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
          title="No data yet"
          description="Add candidates to jobs and move them through the pipeline to see metrics here."
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
          {icon}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
