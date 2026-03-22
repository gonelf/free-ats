import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Briefcase, Calendar, FileText } from "lucide-react";
import type { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { ApplyForm } from "@/components/jobs/ApplyForm";
import ReactMarkdown from "react-markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companySlug: string; jobSlug: string }>;
}): Promise<Metadata> {
  const { companySlug, jobSlug } = await params;
  
  const job = await db.job.findFirst({
    where: {
      organization: { slug: companySlug },
      slug: jobSlug,
    },
    include: { organization: true },
  });

  if (!job) return { title: "Job Not Found" };

  const title = `${job.title} at ${job.organization.name}`;
  const description = job.description.substring(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `https://kitehr.co/${companySlug}/jobs/${jobSlug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://kitehr.co/${companySlug}/jobs/${jobSlug}`,
      siteName: "KiteHR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicJobPage({
  params,
}: {
  params: Promise<{ companySlug: string; jobSlug: string }>;
}) {
  const { companySlug, jobSlug } = await params;

  const job = await db.job.findFirst({
    where: {
      organization: { slug: companySlug },
      slug: jobSlug,
    },
    include: { organization: true },
  });

  if (!job) notFound();

  // If you only want to show OPEN jobs, uncomment this line:
  // if (job.status !== "OPEN") notFound();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.createdAt.toISOString(),
    "validThrough": job.status === "CLOSED" ? job.updatedAt.toISOString() : undefined,
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.organization.name,
      "sameAs": "https://example.com", // Replace with real org URL if available
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location || "Remote",
        ...(job.streetAddress ? { "streetAddress": job.streetAddress } : {}),
        ...(job.postalCode ? { "postalCode": job.postalCode } : {}),
      },
    },
    "baseSalary": job.salaryMin && job.salaryMax ? {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salaryMin,
        "maxValue": job.salaryMax,
        "unitText": "YEAR"
      }
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Header / Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-semibold text-xl text-gray-900">
            {job.organization.name}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              Powered by KiteHR
            </a>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Job Header */}
          <div className="p-8 md:p-12 border-b border-gray-100 bg-white">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {job.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                      <Building className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{job.organization.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Full-time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-gray-500">
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6">
                {(job.salaryMin || job.salaryMax) && (
                  <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-lg border border-emerald-100 shadow-sm">
                    ${job.salaryMin?.toLocaleString() ?? "0"} – ${job.salaryMax?.toLocaleString() ?? "Open"}
                    <span className="text-sm font-medium text-emerald-600 ml-1.5">/ yr</span>
                  </div>
                )}

                <Button size="xl" className="w-full sm:w-auto rounded-2xl px-10 h-14 text-lg font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all" asChild>
                  <a href="#apply-section">
                    Apply for this position
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Job Body */}
          <div className="p-8 md:p-12 pb-16">
            <div className="prose prose-lg prose-indigo max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                About the role
                <div className="h-1 w-12 bg-indigo-600 rounded-full" />
              </h2>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg mb-12">
                {job.description}
              </div>

              {job.requirements && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12 flex items-center gap-3">
                    Requirements
                    <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                  </h2>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                    {job.requirements}
                  </div>
                </>
              )}

              {job.extraDetails && (
                <div className="mt-12 pt-12 border-t border-gray-100">
                  <div className="prose prose-lg prose-indigo max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
                    <ReactMarkdown>{job.extraDetails}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Interested in this role?</h3>
                <p className="text-gray-500 mb-8 max-w-md">
                  Click the button below to start your application process. We look forward to hearing from you!
                </p>
                <Button size="xl" className="rounded-2xl px-12 h-16 text-xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all" asChild>
                  <a href="#apply-section">
                    Apply Now
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <ApplyForm jobId={job.id} />
      </main>

      <footer className="py-12 text-center text-gray-400">
        <p>© {new Date().getFullYear()} {job.organization.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
