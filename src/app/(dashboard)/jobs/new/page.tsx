import { createJob } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { NewJobForm } from "@/components/jobs/NewJobForm";

async function getOrgInfo(userId: string) {
  const member = await db.member.findFirstOrThrow({
    where: { userId },
    include: { organization: { select: { plan: true, aiCreditsBalance: true } } },
  });
  return member.organization;
}

export default async function NewJobPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const org = await getOrgInfo(user!.id);
  const hasAiAccess = org.plan === "PRO" || org.aiCreditsBalance > 0;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/jobs"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Jobs
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">New Job</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Job</h1>

      <NewJobForm action={createJob} hasAiAccess={hasAiAccess} />
    </div>
  );
}
