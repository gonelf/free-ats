import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import { updateJob, deleteJob } from "@/app/actions";

export default async function JobSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    select: { organizationId: true },
  });

  const job = await db.job.findFirst({
    where: { id, organizationId: member.organizationId },
  });

  if (!job) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/jobs/${id}`} className="hover:text-gray-900">
          <ChevronLeft className="inline h-4 w-4" />
          {job.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900">Settings</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Job Settings</h1>

      <form className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <div className="space-y-2">
            <Label>Job title</Label>
            <Input name="title" defaultValue={job.title} required />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input name="location" defaultValue={job.location || ""} />
          </div>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label>Street address (optional)</Label>
              <Input name="streetAddress" defaultValue={job.streetAddress || ""} placeholder="e.g. 123 Main St" />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Postal code (optional)</Label>
              <Input name="postalCode" defaultValue={job.postalCode || ""} placeholder="e.g. 94105" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              name="status"
              defaultValue={job.status}
              className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900"
            >
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={job.description} rows={8} />
          </div>
          <div className="space-y-2">
            <Label>Requirements</Label>
            <Textarea
              name="requirements"
              defaultValue={job.requirements || ""}
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="submit"
            formAction={async (fd) => {
              "use server";
              await updateJob(id, fd);
              redirect(`/jobs/${id}`);
            }}
          >
            Save Changes
          </Button>

          <Button
            type="submit"
            variant="destructive"
            formAction={async () => {
              "use server";
              await deleteJob(id);
            }}
          >
            Delete Job
          </Button>
        </div>
      </form>
    </div>
  );
}
