import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  BarChart3,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports — KiteHR",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    select: { organizationId: true },
  });

  const orgId = member.organizationId;

  // Fetch all data in parallel
  const [jobs, candidates, applications, pipeline, interviews, screenings] = await Promise.all([
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
        aiScore: true,
        stage: { select: { name: true, color: true } },
        job: { select: { title: true } },
      },
    }),
    db.pipeline.findFirst({
      where: { organizationId: orgId, isDefault: true },
      include: { stages: { orderBy: { order: "asc" } } },
    }),
    db.interview.findMany({
      where: { application: { job: { organizationId: orgId } } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        feedbacks: { select: { overallRating: true, recommendation: true } },
      },
    }),
    db.screening.findMany({
      where: { application: { job: { organizationId: orgId } } },
      select: { id: true, flagged: true, completedAt: true },
    }),
  ]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const openJobs = jobs.filter((j) => j.status === "OPEN").length;
  const draftJobs = jobs.filter((j) => j.status === "DRAFT").length;
  const closedJobs = jobs.filter((j) => j.status === "CLOSED").length;

  const hiredStageNames = ["hired", "offer accepted"];
  const offerStageNames = ["offer", "offer sent", "offer extended"];
  const interviewStageNames = ["interview", "phone screen", "technical", "onsite"];
  const rejectedStageNames = ["rejected", "declined", "not a fit"];

  const hiredCount = applications.filter((a) =>
    hiredStageNames.some((n) => a.stage.name.toLowerCase().includes(n))
  ).length;
  const offerCount = applications.filter((a) =>
    offerStageNames.some((n) => a.stage.name.toLowerCase().includes(n))
  ).length;
  const interviewCount = applications.filter((a) =>
    interviewStageNames.some((n) => a.stage.name.toLowerCase().includes(n))
  ).length;
  const rejectedCount = applications.filter((a) =>
    rejectedStageNames.some((n) => a.stage.name.toLowerCase().includes(n))
  ).length;

  const now = Date.now();
  const avgDaysInPipeline =
    applications.length > 0
      ? Math.round(
          applications.reduce(
            (sum, a) => sum + (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24),
            0
          ) / applications.length
        )
      : 0;

  // ── Hiring funnel ──────────────────────────────────────────────────────────
  const funnelSteps = [
    { label: "Applied", count: applications.length, color: "#6366f1" },
    { label: "Interviewed", count: interviewCount + interviews.length, color: "#8b5cf6" },
    { label: "Screened (AI)", count: screenings.filter((s) => s.completedAt).length, color: "#a78bfa" },
    { label: "Offer Stage", count: offerCount, color: "#22d3ee" },
    { label: "Hired", count: hiredCount, color: "#10b981" },
    { label: "Rejected", count: rejectedCount, color: "#f43f5e" },
  ].filter((s) => s.count > 0);

  // ── Stage breakdown ────────────────────────────────────────────────────────
  const stageCounts: Record<string, { name: string; color: string; count: number }> = {};
  for (const app of applications) {
    const key = app.stageId;
    if (!stageCounts[key]) {
      stageCounts[key] = { name: app.stage.name, color: app.stage.color, count: 0 };
    }
    stageCounts[key].count++;
  }

  const stagesOrdered = pipeline?.stages ?? [];
  const stageData = stagesOrdered.map((s) => ({
    name: s.name,
    color: s.color,
    count: stageCounts[s.id]?.count ?? 0,
  }));
  const maxStageCount = Math.max(...stageData.map((s) => s.count), 1);

  // ── AI score distribution ──────────────────────────────────────────────────
  const scoredApps = applications.filter((a) => a.aiScore !== null);
  const avgScore =
    scoredApps.length > 0
      ? Math.round(scoredApps.reduce((sum, a) => sum + a.aiScore!, 0) / scoredApps.length)
      : null;
  const scoreRanges = [
    { label: "Strong (80–100)", count: scoredApps.filter((a) => a.aiScore! >= 80).length, color: "#10b981" },
    { label: "Good (60–79)", count: scoredApps.filter((a) => a.aiScore! >= 60 && a.aiScore! < 80).length, color: "#f59e0b" },
    { label: "Weak (0–59)", count: scoredApps.filter((a) => a.aiScore! < 60).length, color: "#f43f5e" },
  ];

  // ── Interview stats ────────────────────────────────────────────────────────
  const completedInterviews = interviews.filter((i) => i.status === "COMPLETED");
  const allFeedbacks = completedInterviews.flatMap((i) => i.feedbacks);
  const avgInterviewRating =
    allFeedbacks.length > 0
      ? (allFeedbacks.reduce((sum, f) => sum + f.overallRating, 0) / allFeedbacks.length).toFixed(1)
      : null;
  const hireRecommendations = allFeedbacks.filter(
    (f) => f.recommendation === "STRONG_YES" || f.recommendation === "YES"
  ).length;

  // ── Screening stats ────────────────────────────────────────────────────────
  const completedScreenings = screenings.filter((s) => s.completedAt).length;
  const flaggedScreenings = screenings.filter((s) => s.flagged).length;

  // ── Top jobs ───────────────────────────────────────────────────────────────
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Hiring pipeline analytics</p>
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
          sub={`${offerCount} in offer stage`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          label="Avg. Days in Pipeline"
          value={avgDaysInPipeline}
          sub="from application date"
        />
      </div>

      {/* Hiring funnel */}
      {funnelSteps.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Hiring Funnel</h2>
          <div className="flex items-end gap-3">
            {funnelSteps.map((step, i) => {
              const maxCount = funnelSteps[0].count;
              const heightPct = maxCount > 0 ? Math.max(8, Math.round((step.count / maxCount) * 100)) : 8;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">{step.count}</span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{ height: `${heightPct}px`, backgroundColor: step.color, minHeight: "8px" }}
                  />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* AI Score Distribution */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Score Distribution</h2>
          </div>
          {scoredApps.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">No candidates scored yet.</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {avgScore}<span className="text-sm font-normal text-gray-400 dark:text-gray-500"> avg</span>
              </p>
              <div className="space-y-2">
                {scoreRanges.map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{r.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{r.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">{scoredApps.length} of {applications.length} candidates scored</p>
            </>
          )}
        </div>

        {/* Interview Stats */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Interviews</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{interviews.length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{completedInterviews.length} completed</p>
            </div>
            {avgInterviewRating && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {"★".repeat(Math.round(Number(avgInterviewRating)))} {avgInterviewRating}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">avg interviewer rating</p>
              </div>
            )}
            {allFeedbacks.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {hireRecommendations} / {allFeedbacks.length}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">hire recommendations</p>
              </div>
            )}
          </div>
        </div>

        {/* Screening Stats */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Integrity Screening</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{screenings.length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{completedScreenings} completed</p>
            </div>
            {flaggedScreenings > 0 && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{flaggedScreenings} flagged</p>
                <p className="text-xs text-red-500 dark:text-red-400">possible AI-generated responses</p>
              </div>
            )}
            {flaggedScreenings === 0 && screenings.length > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400">No integrity flags detected</p>
            )}
          </div>
        </div>
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
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{stage.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stage.count}</span>
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
              <li key={job.title} className="flex items-center justify-between text-sm">
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
