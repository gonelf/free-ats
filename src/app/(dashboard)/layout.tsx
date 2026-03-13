import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { MONTHLY_CREDITS } from "@/lib/ai/credits";

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

  const org = await getOrCreateOrg(
    user.id,
    user.user_metadata as Record<string, string>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        orgName={org.name}
        isPro={org.plan === "PRO"}
        aiCreditsBalance={org.aiCreditsBalance}
        aiCreditsMonthly={MONTHLY_CREDITS}
        aiCreditsResetAt={org.aiCreditsResetAt}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
