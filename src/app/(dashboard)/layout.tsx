import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { FREE_TRIAL_CREDITS, MONTHLY_CREDITS } from "@/lib/ai/credits";
import { FeedbackSystem } from "@/components/feedback/FeedbackSystem";
import { getFeedbacks } from "@/app/actions/feedback";

async function getOrg(userId: string) {
  const membership = await db.member.findFirst({
    where: { userId },
    include: { organization: true },
  });
  return membership?.organization ?? null;
}

async function isAppAdmin(email: string) {
  const admin = await db.appAdmin.findUnique({ where: { email } });
  return !!admin;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [org, isAdmin, initialFeedbacks] = await Promise.all([
    getOrg(user.id),
    user.email ? isAppAdmin(user.email) : false,
    getFeedbacks(),
  ]);

  if (!org) {
    redirect("/setup");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar
        orgName={org.name}
        isPro={org.plan === "PRO"}
        aiCreditsBalance={org.aiCreditsBalance}
        aiCreditsMonthly={org.plan === "PRO" ? MONTHLY_CREDITS : FREE_TRIAL_CREDITS}
        aiCreditsResetAt={org.aiCreditsResetAt}
        isAppAdmin={isAdmin}
      />
      <main className="flex-1 overflow-y-auto relative">
        <div className="pt-14 md:pt-6 p-4 md:p-8">{children}</div>
        <FeedbackSystem initialFeedbacks={initialFeedbacks} currentUserId={user.id} />
      </main>
    </div>
  );
}
