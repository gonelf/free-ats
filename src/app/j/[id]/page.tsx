import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Briefcase, FileText } from "lucide-react";
import type { Metadata } from "next";
import { ApplyForm } from "@/components/jobs/ApplyForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.organization.name}`,
    description: job.description.substring(0, 160),
  };
}

export default async function PublicJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await db.job.findUnique({
    where: { id },
    include: { organization: true },
  });

  if (!job) notFound();

  // Redirect to slugged URL if it exists
  if (job.slug) {
    redirect(`/j/${job.id}/${job.slug}`);
  }

  // If you only want to show OPEN jobs, uncomment this line:
  // if (job.status !== "OPEN") notFound();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header / Nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-semibold text-xl text-gray-900">
            {job.organization.name}
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={`/`}>Powered by KiteHR</a>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Job Header */}
          <div className="p-8 border-b border-gray-200 bg-white">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-6">
              {job.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4" />
                <span>{job.organization.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>Full-time</span>
              </div>
            </div>

            {(job.salaryMin || job.salaryMax) && (
              <div className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mb-6">
                ${job.salaryMin?.toLocaleString() ?? "0"} - ${job.salaryMax?.toLocaleString() ?? "Open"}
              </div>
            )}

            <div>
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <a href="#apply-section">
                  Apply for this position
                </a>
              </Button>
            </div>
          </div>

          {/* Job Body */}
          <div className="p-8 pb-12 prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About the role</h2>
            <div className="whitespace-pre-wrap text-gray-600 leading-relaxed mb-8">
              {job.description}
            </div>

            {job.requirements && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8">Requirements</h2>
                <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                  {job.requirements}
                </div>
              </>
            )}

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
              <Button size="lg" asChild>
                <a href="#apply-section">
                  Apply for this position
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <ApplyForm jobId={job.id} />
      </main>
    </div>
  );
}
