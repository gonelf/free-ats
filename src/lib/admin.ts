import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const admin = await db.appAdmin.findUnique({
    where: { email: user.email },
  });

  if (!admin) return null;
  return { user, admin };
}

export async function requireAdmin(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getAdminUser>>>["user"];
  admin: NonNullable<Awaited<ReturnType<typeof getAdminUser>>>["admin"];
}> {
  const result = await getAdminUser();
  if (!result) {
    redirect("/login");
  }
  return result;
}
