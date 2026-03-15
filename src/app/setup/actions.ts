"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const companyName = (formData.get("companyName") as string | null)?.trim();
  if (!companyName) return;

  // Guard: don't create a second org if one was already created
  const existing = await db.member.findFirst({ where: { userId: user.id } });
  if (existing) {
    redirect("/jobs");
  }

  const baseSlug = companyName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let suffix = 0;
  while (await db.organization.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }

  await db.organization.create({
    data: {
      name: companyName,
      slug,
      members: {
        create: { userId: user.id, role: "OWNER" },
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

  redirect("/jobs");
}
