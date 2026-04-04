import { notFound } from "next/navigation";
import { demoJobs } from "@/components/home/demo-data";
import { AssessmentClient } from "./AssessmentClient";
import type { Metadata } from "next";

export function generateStaticParams() {
  return demoJobs.map((j) => ({ jobId: j.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobId: string }>;
}): Promise<Metadata> {
  const { jobId } = await params;
  const job = demoJobs.find((j) => j.id === jobId);
  if (!job) return {};
  return {
    title: `${job.title} Signal Assessment — KiteHR`,
    description: `Complete a 13-question Signal Micro-Audition for a ${job.title} role. No account needed. Results shown immediately.`,
    alternates: { canonical: `/demo/${jobId}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = demoJobs.find((j) => j.id === jobId);
  if (!job) notFound();
  return <AssessmentClient job={job} />;
}
