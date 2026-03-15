import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import SetupForm from "./SetupForm";

export default async function SetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If user already has an org, send them to the dashboard
  const existing = await db.member.findFirst({
    where: { userId: user.id },
  });
  if (existing) {
    redirect("/jobs");
  }

  return <SetupForm />;
}
