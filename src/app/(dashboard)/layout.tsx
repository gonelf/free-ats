import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { FREE_TRIAL_CREDITS, MONTHLY_CREDITS } from "@/lib/ai/credits";

async function getOrCreateOrg(userId: string, metadata: Record<string, string>) {
  // Check if user is already a member of an org
  const membership = await db.member.findFirst({
    where: { userId },
    include: { organization: true },
  });

  if (membership) {
    return membership.organization;
  }

  // Create new org for first-time users
  const companyName = metadata.company_name || metadata.name || "My Company";
  const baseSlug = companyName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Ensure unique slug
  let slug = baseSlug;
  let suffix = 0;
  while (await db.organization.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }

  const org = await db.organization.create({
    data: {
      name: companyName,
      slug,
      members: {
        create: { userId, role: "OWNER" },
      },
      pipelines: {
        create: {
          name: "Default Pipeline",
          isDefault: true,
          stages: {
            create: [
              { name: "Applied", order: 0, color: "#6366f1" },
              { name: "Screening", order: 1, color: "#f59e0b" },
              { name: "Interview", order: 2, color: "#3b82f6" },
              { name: "Offer", order: 3, color: "#10b981" },
              { name: "Hired", order: 4, color: "#22c55e" },
            ],
          },
        },
      },
    },
  });

  return org;
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

  let org;
  try {
    org = await getOrCreateOrg(
      user.id,
      user.user_metadata as Record<string, string>
    );
  } catch (err) {
    // Database may be unavailable or migrations pending — show a recoverable error page
    console.error("[DashboardLayout] Failed to load organization:", err);
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-500 mb-4">
            We couldn&apos;t load your workspace. Please try refreshing the page.
            If the problem persists, contact support.
          </p>
          <a
            href="/"
            className="text-sm text-indigo-600 hover:underline"
          >
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        orgName={org.name}
        isPro={org.plan === "PRO"}
        aiCreditsBalance={org.aiCreditsBalance}
        aiCreditsMonthly={org.plan === "PRO" ? MONTHLY_CREDITS : FREE_TRIAL_CREDITS}
        aiCreditsResetAt={org.aiCreditsResetAt}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
